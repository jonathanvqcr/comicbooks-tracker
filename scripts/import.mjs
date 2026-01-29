#!/usr/bin/env node
/**
 * Parse comic_collection_tracker.xlsx + Ebay_Purchase_History_*.xlsx
 * and generate src/data/collection.json.
 *
 * Usage: node scripts/import.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const OUTPUT = join(__dirname, "..", "src", "data", "collection.json");

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function readSheet(filePath, sheetName) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[sheetName || wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: null });
}

function main() {
  const trackerPath = join(DATA_DIR, "comic_collection_tracker.xlsx");

  // --- All Purchases ---
  const purchases = readSheet(trackerPath, "All Purchases");
  const coverA = {};   // series -> Set<vol>
  const allVols = {};   // series -> Set<vol>

  for (const row of purchases) {
    const series = row["Series"];
    const vol = row["Volume #"];
    const cover = row["Cover"] || "";
    if (!series || vol == null) continue;
    const v = Number(vol);
    if (!allVols[series]) allVols[series] = new Set();
    allVols[series].add(v);
    if (cover.toUpperCase().includes("CVR A")) {
      if (!coverA[series]) coverA[series] = new Set();
      coverA[series].add(v);
    }
  }

  // --- Collection Summary (for max volume) ---
  const summary = readSheet(trackerPath, "Collection Summary");
  const summaryMax = {};
  for (const row of summary) {
    const name = row["Series"];
    const volsStr = String(row["Volumes Owned"] || "");
    const nums = [...volsStr.matchAll(/\d+/g)].map((m) => Number(m[0]));
    if (name && nums.length) summaryMax[name] = Math.max(...nums);
  }

  // --- item_name -> { series, vol, cover } mapping ---
  const itemInfo = {};
  for (const row of purchases) {
    const name = (row["Item Name"] || "").trim();
    if (row["Series"] && row["Volume #"] != null && name) {
      itemInfo[name] = {
        series: row["Series"],
        vol: Number(row["Volume #"]),
        cover: row["Cover"] || "",
      };
    }
  }

  // --- Extract images from eBay files ---
  const seriesImages = {};
  // issueCovers: series -> vol -> [ { cover, imageUrl } ]
  const issueCovers = {};

  const ebayFiles = readdirSync(DATA_DIR).filter(
    (f) => f.startsWith("Ebay_Purchase_History_") && f.endsWith(".xlsx")
  );

  // Track seen cover+vol combos to avoid duplicates
  const seenCovers = new Set();

  for (const file of ebayFiles) {
    const rows = readSheet(join(DATA_DIR, file));
    for (const row of rows) {
      const itemName = (row["ItemName"] || "").trim();
      const imgUrl = row["Image URL"];
      if (!imgUrl || !itemName) continue;
      const info = itemInfo[itemName];
      if (!info) continue;
      const isCoverA = info.cover.toUpperCase().includes("CVR A");

      if (!seriesImages[info.series] || isCoverA) {
        seriesImages[info.series] = imgUrl;
      }

      // Collect all covers per issue
      const key = `${info.series}|${info.vol}|${info.cover}`;
      if (!seenCovers.has(key)) {
        seenCovers.add(key);
        if (!issueCovers[info.series]) issueCovers[info.series] = {};
        if (!issueCovers[info.series][info.vol]) issueCovers[info.series][info.vol] = [];
        issueCovers[info.series][info.vol].push({
          cover: info.cover,
          imageUrl: imgUrl,
        });
      }
    }
  }

  // Sort covers per issue: Cover A first, then alphabetically
  for (const series of Object.values(issueCovers)) {
    for (const vol of Object.keys(series)) {
      series[vol].sort((a, b) => {
        const aIsA = a.cover.toUpperCase().includes("CVR A") ? 0 : 1;
        const bIsA = b.cover.toUpperCase().includes("CVR A") ? 0 : 1;
        if (aIsA !== bIsA) return aIsA - bIsA;
        return a.cover.localeCompare(b.cover);
      });
    }
  }

  // --- Build output ---
  const seriesList = Object.keys(allVols)
    .sort()
    .map((name) => {
      const vols = [...allVols[name]].sort((a, b) => a - b);
      const maxVol = summaryMax[name] || Math.max(...vols);
      const ownedA = coverA[name] ? [...coverA[name]].sort((a, b) => a - b) : [];
      const ownedOther = [...allVols[name]]
        .filter((v) => !coverA[name]?.has(v))
        .sort((a, b) => a - b);

      const covers = issueCovers[name] || {};
      const issueCoversOut = {};
      for (const [v, arr] of Object.entries(covers)) {
        issueCoversOut[String(v)] = arr;
      }

      return {
        id: slugify(name),
        name,
        publisher: "DC",
        totalIssues: maxVol,
        ownedCoverA: ownedA,
        ownedOther: ownedOther,
        imageUrl: seriesImages[name] || "",
        issueCovers: issueCoversOut,
      };
    });

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify({ series: seriesList }, null, 2));
  console.log(`Wrote ${seriesList.length} series to ${OUTPUT}`);
}

main();

import type { Series, IssueStatus } from "../types";

export function getIssueStatus(series: Series, issue: number): IssueStatus {
  if (series.ownedCoverA.includes(issue)) return "coverA";
  if (series.ownedOther.includes(issue)) return "otherCover";
  return "missing";
}

export function getCompletionPercent(series: Series): number {
  if (series.totalIssues === 0) return 100;
  return Math.round((series.ownedCoverA.length / series.totalIssues) * 100);
}

export function getMissingCoverA(series: Series): number[] {
  const missing: number[] = [];
  for (let i = 1; i <= series.totalIssues; i++) {
    if (!series.ownedCoverA.includes(i)) {
      missing.push(i);
    }
  }
  return missing;
}

export function isComplete(series: Series): boolean {
  return series.ownedCoverA.length === series.totalIssues;
}

import { useState, useMemo } from "react";
import collection from "../../data/collection.json";
import type { Series, SortField } from "../../types";
import { getCompletionPercent, isComplete, getConsecutiveCount } from "../../utils/collection";
import SeriesCard from "./SeriesCard";
import "./Dashboard.css";

const allSeries = collection.series as Series[];

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortField>("name");

  const filtered = useMemo(() => {
    let result = allSeries;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "completion")
        return getCompletionPercent(b) - getCompletionPercent(a);
      return b.totalIssues - a.totalIssues;
    });
    return result;
  }, [search, sort]);

  const totalConsecutive = allSeries.reduce((n, s) => n + getConsecutiveCount(s), 0);
  const totalIssues = allSeries.reduce((n, s) => n + s.totalIssues, 0);
  const completeSeries = allSeries.filter((s) => isComplete(s)).length;

  return (
    <div>
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{allSeries.length}</span>
          <span className="stat-label">Series</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {totalConsecutive}/{totalIssues}
          </span>
          <span className="stat-label">Consecutive Owned</span>
        </div>
        <div className="stat">
          <span className="stat-value">{completeSeries}</span>
          <span className="stat-label">Complete</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {Math.round((totalConsecutive / totalIssues) * 100)}%
          </span>
          <span className="stat-label">Overall</span>
        </div>
      </div>

      <div className="controls">
        <input
          className="search-input"
          type="text"
          placeholder="Search series..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortField)}
        >
          <option value="name">Sort by Name</option>
          <option value="completion">Sort by Completion</option>
          <option value="totalIssues">Sort by Total Issues</option>
        </select>
      </div>

      <div className="series-grid">
        {filtered.map((s) => (
          <SeriesCard key={s.id} series={s} />
        ))}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import type { Series } from "../../types";
import { getCompletionPercent, isComplete, getConsecutiveCount } from "../../utils/collection";
import "./Dashboard.css";

export default function SeriesCard({ series }: { series: Series }) {
  const pct = getCompletionPercent(series);
  const complete = isComplete(series);

  return (
    <Link to={`/series/${series.id}`} className="series-card">
      <div className="card-content">
        {series.imageUrl && (
          <img
            src={series.imageUrl}
            alt={series.name}
            className="card-thumbnail"
          />
        )}
        <div className="card-info">
          <div className="card-header">
            <h3 className="card-title">{series.name}</h3>
            <span className="card-publisher">{series.publisher}</span>
          </div>
        <div className="card-stat">
          <span>Issues 1–{series.totalIssues}</span>
          <span>
            {getConsecutiveCount(series)}/{series.totalIssues} consecutive
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${pct}%`,
              backgroundColor: complete
                ? "var(--green)"
                : pct > 50
                  ? "var(--amber)"
                  : "var(--red)",
            }}
          />
        </div>
        <div className="card-footer">
          <span
            className={`status-badge ${complete ? "status-complete" : "status-incomplete"}`}
          >
            {complete ? "Complete" : `${pct}%`}
          </span>
          {series.ownedOther.length > 0 && (
            <span className="other-covers">
              +{series.ownedOther.length} other cover
              {series.ownedOther.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        </div>
      </div>
    </Link>
  );
}

import { useParams, Link } from "react-router-dom";
import collection from "../../data/collection.json";
import type { Series } from "../../types";
import {
  getIssueStatus,
  getCompletionPercent,
  getMissingCoverA,
} from "../../utils/collection";
import "./SeriesDetail.css";

const allSeries = collection.series as Series[];

export default function SeriesDetail() {
  const { id } = useParams<{ id: string }>();
  const series = allSeries.find((s) => s.id === id);

  if (!series) {
    return (
      <div>
        <p>Series not found.</p>
        <Link to="/">Back to dashboard</Link>
      </div>
    );
  }

  const pct = getCompletionPercent(series);
  const missing = getMissingCoverA(series);
  const issues = Array.from({ length: series.totalIssues }, (_, i) => i + 1);

  return (
    <div>
      <Link to="/" className="back-link">
        ← Back to Dashboard
      </Link>

      <div className="detail-header">
        {series.imageUrl && (
          <img
            src={series.imageUrl}
            alt={series.name}
            className="detail-thumbnail"
          />
        )}
        <div>
          <h1 className="detail-title">{series.name}</h1>
          <span className="detail-publisher">{series.publisher}</span>
        </div>
        <div className="detail-stats">
          <span className="detail-pct">{pct}%</span>
          <span className="detail-count">
            {series.ownedCoverA.length}/{series.totalIssues} Cover A
          </span>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="missing-banner">
          Missing Cover A: #{missing.join(", #")}
        </div>
      )}

      <div className="legend">
        <span className="legend-item">
          <span className="legend-swatch legend-coverA" /> Cover A
        </span>
        <span className="legend-item">
          <span className="legend-swatch legend-other" /> Other Cover
        </span>
        <span className="legend-item">
          <span className="legend-swatch legend-missing" /> Missing
        </span>
      </div>

      <div className="issue-grid">
        {issues.map((num) => {
          const status = getIssueStatus(series, num);
          const imgUrl = series.issueImages[String(num)];
          return (
            <div key={num} className={`issue-cell issue-${status}`}>
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={`${series.name} #${num}`}
                  className="issue-cover"
                />
              ) : (
                <div className="issue-placeholder" />
              )}
              <span className="issue-num">#{num}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

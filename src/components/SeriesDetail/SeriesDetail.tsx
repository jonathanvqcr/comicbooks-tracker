import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import collection from "../../data/collection.json";
import type { Series } from "../../types";
import {
  getIssueStatus,
  getCompletionPercent,
  getMissingIssues,
  getConsecutiveCount,
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

  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const pct = getCompletionPercent(series);
  const consecutive = getConsecutiveCount(series);
  const missing = getMissingIssues(series);
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
            {consecutive}/{series.totalIssues} consecutive
          </span>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="missing-banner">
          Missing: #{missing.join(", #")}
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
          const covers = series.issueCovers[String(num)] || [];
          return (
            <div key={num} className={`issue-cell issue-${status}`}>
              {covers.length > 0 ? (
                <div className="issue-covers">
                  {covers.map((c, i) => (
                    <div key={i} className="cover-item">
                      <img
                        src={c.imageUrl}
                        alt={`${series.name} #${num} ${c.cover}`}
                        className="issue-cover"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightbox({ src: c.imageUrl, alt: `${series.name} #${num} - ${c.cover}` });
                        }}
                      />
                      <span className="cover-label">{c.cover}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="issue-placeholder" />
              )}
              <span className="issue-num">#{num}</span>
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.alt} className="lightbox-img" />
            <p className="lightbox-caption">{lightbox.alt}</p>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import type { Series, IssueStatus } from "../types";

export function getIssueStatus(series: Series, issue: number): IssueStatus {
  if (series.ownedCoverA.includes(issue)) return "coverA";
  if (series.ownedOther.includes(issue)) return "otherCover";
  return "missing";
}

/** All owned issues (any cover) */
function getAllOwned(series: Series): Set<number> {
  return new Set([...series.ownedCoverA, ...series.ownedOther]);
}

/** Count of consecutive issues owned starting from #1 */
export function getConsecutiveCount(series: Series): number {
  const owned = getAllOwned(series);
  let count = 0;
  for (let i = 1; i <= series.totalIssues; i++) {
    if (!owned.has(i)) break;
    count++;
  }
  return count;
}

export function getCompletionPercent(series: Series): number {
  if (series.totalIssues === 0) return 100;
  return Math.round((getConsecutiveCount(series) / series.totalIssues) * 100);
}

export function isComplete(series: Series): boolean {
  return getConsecutiveCount(series) === series.totalIssues;
}

export function getMissingIssues(series: Series): number[] {
  const owned = getAllOwned(series);
  const missing: number[] = [];
  for (let i = 1; i <= series.totalIssues; i++) {
    if (!owned.has(i)) missing.push(i);
  }
  return missing;
}

export interface Series {
  id: string;
  name: string;
  publisher: string;
  totalIssues: number;
  ownedCoverA: number[];
  ownedOther: number[];
  imageUrl: string;
  issueImages: Record<string, string>;
}

export interface Collection {
  series: Series[];
}

export type IssueStatus = "coverA" | "otherCover" | "missing";

export type SortField = "name" | "completion" | "totalIssues";

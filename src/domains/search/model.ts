export type SearchResultType = "notice" | "blog";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  excerpt: string;
  url: string;
  date: string;
}

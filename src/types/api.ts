export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  pages?: number;
}

export interface PaginationInput {
  page?: unknown;
  limit?: unknown;
}

export type UserRole = "ADMIN" | "STAFF";

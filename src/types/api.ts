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

export interface RestaurantScope {
  id: string;
  name: string;
  slug: string;
  storageFolder: string;
}

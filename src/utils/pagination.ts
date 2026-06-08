import type { ApiMeta, PaginationInput } from "../types/api";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const getPagination = (query: PaginationInput) => {
  const page = clamp(Number(query.page) || 1, 1, 10_000);
  const limit = clamp(Number(query.limit) || 12, 1, 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getPaginationMeta = (page: number, limit: number, total: number): ApiMeta => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit) || 1,
});

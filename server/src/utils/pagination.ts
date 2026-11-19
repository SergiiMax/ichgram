export function toPage<T extends { id: string }>(items: T[], limit: number) {
  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;
  const last = page.at(-1);
  return { items: page, nextCursor: hasMore && last ? last.id : null };
}

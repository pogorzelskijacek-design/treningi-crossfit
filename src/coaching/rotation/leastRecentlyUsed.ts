/**
 * Picks the item whose last use is furthest in the past (or never used, which
 * outranks everything). Ties fall back to `rotation` order.
 */
export function pickLeastRecentlyUsed<T>(
  rotation: readonly T[],
  lastUsedRecencyIndex: (item: T) => number
): T {
  let best = rotation[0];
  let bestRecency = -1;

  for (const item of rotation) {
    const recency = lastUsedRecencyIndex(item);
    if (recency > bestRecency) {
      bestRecency = recency;
      best = item;
    }
  }

  return best;
}

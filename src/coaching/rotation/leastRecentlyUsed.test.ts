import { describe, expect, it } from 'vitest';
import { pickLeastRecentlyUsed } from './leastRecentlyUsed';

describe('pickLeastRecentlyUsed', () => {
  it('picks the first item when nothing has been used', () => {
    const result = pickLeastRecentlyUsed(['a', 'b', 'c'], () => Infinity);
    expect(result).toBe('a');
  });

  it('never-used items outrank anything that has been used', () => {
    const result = pickLeastRecentlyUsed(['a', 'b', 'c'], (item) => (item === 'b' ? Infinity : 0));
    expect(result).toBe('b');
  });

  it('picks the item whose last use is furthest in the past', () => {
    const recency: Record<string, number> = { a: 0, b: 2, c: 1 };
    const result = pickLeastRecentlyUsed(['a', 'b', 'c'], (item) => recency[item]);
    expect(result).toBe('b');
  });

  it('breaks ties using rotation order', () => {
    const result = pickLeastRecentlyUsed(['a', 'b', 'c'], () => 3);
    expect(result).toBe('a');
  });
});

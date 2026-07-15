import { describe, expect, it } from 'vitest';
import { RecentChoice, randomBetween } from '../src/game/random.js';

describe('random helpers', () => {
  it('supports bounds supplied in either order', () => {
    expect(randomBetween(-100, -200, () => 0)).toBe(-200);
    expect(randomBetween(-100, -200, () => 1)).toBe(-100);
  });

  it('avoids recent choices while alternatives exist', () => {
    const choices = new RecentChoice(['a', 'b', 'c'], 2, () => 0);
    expect([choices.next(), choices.next(), choices.next()]).toEqual(['a', 'b', 'c']);
  });
});

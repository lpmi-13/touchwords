import { describe, expect, it } from 'vitest';
import { GameSession } from '../src/game/session.js';

const testLevels = [
  {
    progressTotal: 2,
    bonusTime: 60,
    verbs: {
      walked: { regular: true },
      goed: { regular: false, correction: 'went' },
    },
  },
  {
    progressTotal: 1,
    bonusTime: 30,
    verbs: {
      eated: { regular: false, correction: 'ate' },
    },
  },
];

describe('GameSession', () => {
  it('awards irregular selections and records their corrections', () => {
    const session = new GameSession(testLevels);

    expect(session.selectWord('goed', testLevels[0].verbs.goed)).toEqual({
      correct: true,
      levelComplete: false,
    });
    expect(session.score).toBe(10);
    expect(session.bonusWords).toEqual([{ text: 'goed', answer: 'went' }]);

    expect(session.selectWord('goed', testLevels[0].verbs.goed).levelComplete).toBe(true);
  });

  it('removes a heart for regular verbs and ends after three mistakes', () => {
    const session = new GameSession(testLevels);

    expect(session.selectWord('walked', testLevels[0].verbs.walked).gameOver).toBe(false);
    expect(session.selectWord('walked', testLevels[0].verbs.walked).gameOver).toBe(false);
    expect(session.selectWord('walked', testLevels[0].verbs.walked).gameOver).toBe(true);
    expect(session.lives).toBe(0);
  });

  it('keeps the original bonus scoring for regular and final levels', () => {
    const session = new GameSession(testLevels);

    session.recordBonusCorrection();
    expect(session.addTimeBonus(12)).toBe(120);
    expect(session.score).toBe(170);

    expect(session.advanceLevel()).toBe(true);
    session.recordBonusCorrection();
    expect(session.addTimeBonus(12)).toBe(22);
    expect(session.score).toBe(242);
    expect(session.advanceLevel()).toBe(false);
  });

  it('resets transient level state while preserving the running score', () => {
    const session = new GameSession(testLevels);
    session.selectWord('goed', testLevels[0].verbs.goed);
    session.selectWord('walked', testLevels[0].verbs.walked);

    session.advanceLevel();

    expect(session.score).toBe(10);
    expect(session.lives).toBe(3);
    expect(session.progress).toBe(0);
    expect(session.bonusWords).toEqual([]);
  });
});

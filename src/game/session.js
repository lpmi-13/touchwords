const STARTING_LIVES = 3;

export class GameSession {
  constructor(levels) {
    if (!Array.isArray(levels) || levels.length === 0) {
      throw new Error('Touchwords needs at least one level.');
    }

    this.levels = levels;
    this.restart();
  }

  get level() {
    return this.levels[this.levelIndex];
  }

  get isFinalLevel() {
    return this.levelIndex === this.levels.length - 1;
  }

  get isLevelComplete() {
    return this.progress >= this.level.progressTotal;
  }

  restart() {
    this.levelIndex = 0;
    this.score = 0;
    this.startLevel();
  }

  startLevel() {
    this.lives = STARTING_LIVES;
    this.progress = 0;
    this.bonusWords = [];
  }

  selectWord(text, word) {
    if (word.regular) {
      this.lives = Math.max(0, this.lives - 1);
      return { correct: false, gameOver: this.lives === 0 };
    }

    this.score += 10;
    this.progress += 1;
    this.bonusWords.push({ text, answer: word.correction });

    return { correct: true, levelComplete: this.isLevelComplete };
  }

  recordBonusCorrection() {
    this.score += 50;
  }

  addTimeBonus(secondsRemaining) {
    const seconds = Math.max(0, Math.floor(secondsRemaining));
    const points = this.isFinalLevel ? seconds + 10 : seconds * 10;
    this.score += points;
    return points;
  }

  advanceLevel() {
    if (this.isFinalLevel) return false;

    this.levelIndex += 1;
    this.startLevel();
    return true;
  }
}

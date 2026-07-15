export function randomBetween(first, second, random = Math.random) {
  const lower = Math.min(first, second);
  const upper = Math.max(first, second);
  return lower + random() * (upper - lower);
}

export class RecentChoice {
  #recent = [];

  constructor(values, historySize = 10, random = Math.random) {
    this.values = [...values];
    this.historySize = historySize;
    this.random = random;
  }

  next() {
    const unseen = this.values.filter((value) => !this.#recent.includes(value));
    const candidates = unseen.length > 0 ? unseen : this.values;
    const choice = candidates[Math.floor(this.random() * candidates.length)];

    this.#recent.push(choice);
    if (this.#recent.length > this.historySize) this.#recent.shift();

    return choice;
  }
}

import { RecentChoice, randomBetween } from './random.js';

export class WordField {
  #animationFrame = 0;
  #lastFrame = 0;
  #spawnTimer = 0;
  #words = new Set();

  constructor(element, level, onSelect) {
    if (!(element instanceof HTMLElement)) {
      throw new TypeError('WordField needs a DOM element.');
    }

    this.element = element;
    this.level = level;
    this.onSelect = onSelect;
    this.choices = new RecentChoice(Object.keys(level.verbs));
  }

  start() {
    this.#lastFrame = performance.now();
    this.#animationFrame = requestAnimationFrame(this.#update);
    this.#spawnTimer = window.setInterval(() => this.#spawn(), this.level.timeToSpawn);
  }

  stop() {
    window.clearInterval(this.#spawnTimer);
    cancelAnimationFrame(this.#animationFrame);
    this.#spawnTimer = 0;
    this.#animationFrame = 0;

    for (const word of this.#words) word.element.disabled = true;
  }

  destroy() {
    this.stop();
    for (const word of this.#words) word.element.remove();
    this.#words.clear();
  }

  #spawn() {
    const text = this.choices.next();
    const data = this.level.verbs[text];
    const element = document.createElement('button');
    element.className = 'floating-word';
    element.type = 'button';
    element.textContent = text;
    element.setAttribute('aria-label', `Select ${text}`);
    this.element.append(element);

    const bounds = this.element.getBoundingClientRect();
    const wordBounds = element.getBoundingClientRect();
    const word = {
      element,
      x: randomBetween(0, Math.max(0, bounds.width - wordBounds.width)),
      y: bounds.height + wordBounds.height,
      velocityX: randomBetween(this.level.velocityXlower, this.level.velocityXhigher),
      velocityY: randomBetween(this.level.velocityYlower, this.level.velocityYhigher),
      width: wordBounds.width,
      height: wordBounds.height,
      removing: false,
    };

    let pointerHandled = false;
    const select = () => {
      if (word.removing) return;
      const result = this.onSelect(text, data, element);
      if (result.correct) this.#collect(word);
    };

    element.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      pointerHandled = true;
      window.setTimeout(() => {
        pointerHandled = false;
      }, 400);
      select();
    });
    element.addEventListener('click', () => {
      if (pointerHandled) {
        pointerHandled = false;
        return;
      }

      select();
    });

    this.#words.add(word);
    this.#position(word);
  }

  #collect(word) {
    word.removing = true;
    word.element.disabled = true;
    word.element.classList.add('floating-word--collected');
    window.setTimeout(() => this.#remove(word), 360);
  }

  #remove(word) {
    word.element.remove();
    this.#words.delete(word);
  }

  #position(word) {
    word.element.style.transform = `translate3d(${word.x}px, ${word.y}px, 0)`;
  }

  #update = (timestamp) => {
    const elapsed = Math.min((timestamp - this.#lastFrame) / 1000, 0.05);
    this.#lastFrame = timestamp;
    const bounds = this.element.getBoundingClientRect();

    for (const word of this.#words) {
      if (word.removing) continue;

      word.x += word.velocityX * elapsed;
      word.y += word.velocityY * elapsed;

      const maximumX = Math.max(0, bounds.width - word.width);
      if (word.x <= 0 || word.x >= maximumX) {
        word.x = Math.min(Math.max(word.x, 0), maximumX);
        word.velocityX *= -1;
      }

      if (word.y <= 0) {
        word.y = 0;
        word.velocityY = Math.abs(word.velocityY);
      } else if (word.y > bounds.height + word.height) {
        this.#remove(word);
        continue;
      }

      this.#position(word);
    }

    this.#animationFrame = requestAnimationFrame(this.#update);
  };
}

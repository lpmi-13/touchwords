import { levels } from './data/levels.js';
import { GameSession } from './game/session.js';
import { renderBonusScreen } from './screens/bonus-screen.js';
import { renderPlayScreen } from './screens/play-screen.js';
import {
  renderEnd,
  renderInstructions,
  renderLevelComplete,
  renderNextLevel,
  renderSplash,
} from './screens/static-screens.js';

export class TouchwordsApp {
  #cleanup = () => {};

  constructor(root) {
    if (!(root instanceof HTMLElement)) throw new TypeError('Touchwords needs a root element.');
    this.root = root;
    this.session = new GameSession(levels);
  }

  start() {
    this.#show((root) => renderSplash(root, () => this.#showInstructions()));
  }

  #show(renderer) {
    this.#cleanup();
    this.root.replaceChildren();
    this.#cleanup = renderer(this.root) ?? (() => {});
  }

  #showInstructions() {
    this.#show((root) => renderInstructions(root, () => this.#showLevel()));
  }

  #showLevel() {
    this.#show((root) =>
      renderPlayScreen(root, this.session, {
        onLevelComplete: () => this.#showLevelComplete(),
        onGameOver: () => this.#showEnd(false),
      }),
    );
  }

  #showLevelComplete() {
    this.#show((root) =>
      renderLevelComplete(root, this.session.levelIndex + 1, () => this.#showBonus()),
    );
  }

  #showBonus() {
    this.#show((root) =>
      renderBonusScreen(root, this.session, {
        onComplete: () => this.#finishBonus(),
        onExpired: () => this.#finishBonus(),
      }),
    );
  }

  #finishBonus() {
    if (this.session.isFinalLevel) {
      this.#showEnd(true);
      return;
    }

    this.session.advanceLevel();
    this.#show((root) =>
      renderNextLevel(root, this.session.levelIndex + 1, () => this.#showLevel()),
    );
  }

  #showEnd(won) {
    this.#show((root) =>
      renderEnd(root, {
        won,
        score: this.session.score,
        onRestart: () => {
          this.session.restart();
          this.#showLevel();
        },
      }),
    );
  }
}

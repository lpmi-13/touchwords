import { assets } from '../assets.js';
import { WordField } from '../game/word-field.js';

function createHud(session) {
  const hud = document.createElement('header');
  hud.className = 'play-hud';

  const score = document.createElement('p');
  score.className = 'score';
  score.setAttribute('aria-live', 'polite');

  const hearts = document.createElement('div');
  hearts.className = 'hearts';

  hud.append(score, hearts);

  const update = () => {
    score.textContent = `Points: ${session.score}`;
    hearts.replaceChildren();
    hearts.setAttribute('aria-label', `${session.lives} hearts remaining`);
    for (let index = 0; index < session.lives; index += 1) {
      const heart = document.createElement('img');
      heart.src = assets.heart;
      heart.alt = '';
      hearts.append(heart);
    }
  };

  update();
  return { hud, update };
}

function createBurst(screen, source) {
  const sourceBounds = source.getBoundingClientRect();
  const screenBounds = screen.getBoundingClientRect();
  const burst = document.createElement('div');
  burst.className = 'score-burst';
  burst.style.left = `${sourceBounds.left - screenBounds.left + sourceBounds.width / 2}px`;
  burst.style.top = `${sourceBounds.top - screenBounds.top}px`;

  const points = document.createElement('strong');
  points.textContent = '+10';
  burst.append(points);

  for (let index = 0; index < 5; index += 1) {
    const diamond = document.createElement('img');
    diamond.src = assets.diamond;
    diamond.alt = '';
    diamond.style.setProperty('--burst-angle', `${index * 72}deg`);
    burst.append(diamond);
  }

  screen.append(burst);
  window.setTimeout(() => burst.remove(), 800);
}

export function renderPlayScreen(root, session, { onLevelComplete, onGameOver }) {
  const screen = document.createElement('main');
  screen.className = 'game-screen play-screen';
  screen.style.backgroundImage = `linear-gradient(rgb(0 0 0 / 4%), rgb(0 0 0 / 4%)), url("${assets.backgrounds[session.levelIndex]}")`;

  const { hud, update } = createHud(session);
  const fieldElement = document.createElement('div');
  fieldElement.className = 'word-field';
  fieldElement.setAttribute('aria-label', `Level ${session.levelIndex + 1} words`);
  screen.append(fieldElement, hud);
  root.append(screen);

  let transitionTimer = 0;
  const field = new WordField(fieldElement, session.level, (text, word, element) => {
    const result = session.selectWord(text, word);
    update();

    if (result.correct) {
      createBurst(screen, element);
      if (result.levelComplete) {
        field.stop();
        transitionTimer = window.setTimeout(onLevelComplete, 650);
      }
    } else {
      screen.classList.remove('play-screen--mistake');
      requestAnimationFrame(() => screen.classList.add('play-screen--mistake'));
      if (result.gameOver) {
        field.stop();
        transitionTimer = window.setTimeout(onGameOver, 850);
      }
    }

    return result;
  });

  field.start();

  return () => {
    window.clearTimeout(transitionTimer);
    field.destroy();
  };
}

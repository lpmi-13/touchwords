import { assets } from '../assets.js';

export const instructions =
  'This is a game about identifying irregular verbs. They are hiding as regular past-tense verbs by adding “ed” at the end. When you see one that does not usually end in “ed”, select it to collect 10 points. Do not select regular verbs, or you lose one heart.';

function actionButton(label, action) {
  const button = document.createElement('button');
  button.className = 'action-button';
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', action, { once: true });
  return button;
}

function createPanel(title, copy) {
  const panel = document.createElement('section');
  panel.className = 'card';

  const heading = document.createElement('h1');
  heading.textContent = title;
  panel.append(heading);

  if (copy) {
    const paragraph = document.createElement('p');
    paragraph.textContent = copy;
    panel.append(paragraph);
  }

  return panel;
}

export function renderSplash(root, onStart) {
  const screen = document.createElement('main');
  screen.className = 'game-screen splash-screen';

  const logo = document.createElement('img');
  logo.className = 'game-logo';
  logo.src = assets.logo;
  logo.alt = 'Touchwords';

  const subtitle = document.createElement('p');
  subtitle.className = 'splash-subtitle';
  subtitle.textContent = 'Spot the irregular verbs';

  screen.append(logo, subtitle, actionButton('Start game', onStart));
  root.append(screen);
}

export function renderInstructions(root, onContinue) {
  const screen = document.createElement('main');
  screen.className = 'game-screen info-screen';
  const panel = createPanel('How to play', instructions);
  panel.append(actionButton('Continue', onContinue));
  screen.append(panel);
  root.append(screen);
}

export function renderLevelComplete(root, levelNumber, onContinue) {
  const screen = document.createElement('main');
  screen.className = 'game-screen info-screen celebration-screen';
  const panel = createPanel(`Level ${levelNumber} complete!`, 'Now correct the irregular verbs you found.');
  panel.append(actionButton('Start bonus round', onContinue));
  screen.append(panel);
  root.append(screen);
}

export function renderNextLevel(root, levelNumber, onContinue) {
  const screen = document.createElement('main');
  screen.className = 'game-screen info-screen';
  const panel = createPanel(`Ready for level ${levelNumber}?`, 'The words will move a little faster this time.');
  panel.append(actionButton('Continue', onContinue));
  screen.append(panel);
  root.append(screen);
}

export function renderEnd(root, { won, score, onRestart }) {
  const screen = document.createElement('main');
  screen.className = 'game-screen info-screen end-screen';
  const title = won ? 'That’s all—you win!' : 'Game over';
  const copy = won ? `Final score: ${score}` : 'You ran out of hearts.';
  const panel = createPanel(title, copy);
  panel.append(actionButton('Play again', onRestart));
  screen.append(panel);
  root.append(screen);
}

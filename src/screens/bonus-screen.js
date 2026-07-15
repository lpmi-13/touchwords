function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function renderBonusScreen(root, session, { onComplete, onExpired }) {
  const words = [...session.bonusWords];
  let wordIndex = 0;
  let finished = false;
  let acceptingAnswer = true;
  let answerTimer = 0;
  const deadline = performance.now() + session.level.bonusTime * 1000;

  const screen = document.createElement('main');
  screen.className = 'game-screen bonus-screen';

  const hud = document.createElement('header');
  hud.className = 'bonus-hud';

  const score = document.createElement('p');
  score.className = 'score';
  score.textContent = `Points: ${session.score}`;
  score.setAttribute('aria-live', 'polite');

  const timer = document.createElement('time');
  timer.className = 'timer';
  timer.textContent = formatTime(session.level.bonusTime);
  timer.setAttribute('aria-label', `${session.level.bonusTime} seconds remaining`);
  hud.append(score, timer);

  const content = document.createElement('section');
  content.className = 'bonus-content';

  const prompt = document.createElement('p');
  prompt.className = 'bonus-prompt';
  prompt.textContent = 'Correct this word';

  const word = document.createElement('h1');
  word.className = 'word-to-correct';

  const form = document.createElement('form');
  form.className = 'answer-form';

  const label = document.createElement('label');
  label.htmlFor = 'bonus-answer';
  label.textContent = 'Your correction';

  const input = document.createElement('input');
  input.id = 'bonus-answer';
  input.name = 'answer';
  input.type = 'text';
  input.inputMode = 'text';
  input.autocomplete = 'off';
  input.autocapitalize = 'none';
  input.spellcheck = false;
  input.maxLength = 16;
  input.enterKeyHint = 'done';

  const desktopHint = document.createElement('p');
  desktopHint.className = 'input-hint desktop-hint';
  desktopHint.textContent = 'Type the correction with your keyboard.';

  const mobileHint = document.createElement('p');
  mobileHint.className = 'input-hint mobile-hint';
  mobileHint.textContent = 'Tap the answer box to use your device keyboard.';

  const feedback = document.createElement('p');
  feedback.className = 'answer-feedback';
  feedback.setAttribute('aria-live', 'assertive');

  form.append(label, input, desktopHint, mobileHint);
  content.append(prompt, word, form, feedback);
  screen.append(hud, content);
  root.append(screen);

  function secondsRemaining() {
    return Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
  }

  function updateHud() {
    const remaining = secondsRemaining();
    timer.textContent = formatTime(remaining);
    timer.setAttribute('aria-label', `${remaining} seconds remaining`);
    score.textContent = `Points: ${session.score}`;
    return remaining;
  }

  function showWord() {
    word.textContent = words[wordIndex].text;
    input.value = '';
    acceptingAnswer = true;
    input.classList.remove('answer-input--correct');
    feedback.textContent = '';
    input.focus({ preventScroll: true });
  }

  function finishRound() {
    finished = true;
    const timeBonus = session.addTimeBonus(secondsRemaining());
    updateHud();
    input.disabled = true;
    feedback.textContent = `Correct! +50 · Time bonus: +${timeBonus}`;
    screen.classList.add('bonus-screen--complete');
    answerTimer = window.setTimeout(onComplete, 1800);
  }

  function acceptAnswer() {
    acceptingAnswer = false;
    input.classList.add('answer-input--correct');
    session.recordBonusCorrection();
    score.textContent = `Points: ${session.score}`;
    feedback.textContent = 'Correct! +50';
    wordIndex += 1;

    if (wordIndex === words.length) {
      finishRound();
      return;
    }

    answerTimer = window.setTimeout(showWord, 320);
  }

  function expire() {
    if (finished) return;
    finished = true;
    input.disabled = true;
    timer.textContent = '00:00';
    timer.setAttribute('aria-label', 'No time remaining');
    prompt.textContent = 'Time’s up';
    word.textContent = '';
    feedback.textContent = 'Moving on…';
    screen.classList.add('bonus-screen--expired');
    answerTimer = window.setTimeout(onExpired, 2200);
  }

  function checkAnswer() {
    if (!acceptingAnswer || finished) return;
    const sanitised = input.value.toLowerCase().replace(/[^a-z]/g, '');
    if (input.value !== sanitised) input.value = sanitised;
    if (sanitised === words[wordIndex].answer) acceptAnswer();
  }

  input.addEventListener('input', checkAnswer);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    checkAnswer();
  });

  const clock = window.setInterval(() => {
    if (updateHud() === 0) expire();
  }, 100);

  showWord();

  return () => {
    finished = true;
    window.clearInterval(clock);
    window.clearTimeout(answerTimer);
  };
}

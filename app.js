import { createSteps, generateNumbers, isCorrectMove } from './sorting.js';
import { translations } from './translations.js';

const element = id => document.getElementById(id);
const chart = element('chart');

let language = savedLanguage();
let originalNumbers;
let round;
let stepIndex = 0;
let selected = null;
let draggedIndex = null;
let notice = { key: 'howToSwap', values: [], tone: '' };

function savedLanguage() {
  try {
    return localStorage.getItem('sort-language') === 'ro' ? 'ro' : 'en';
  } catch {
    return 'en';
  }
}

function text(key, ...values) {
  const translation = translations[language][key];
  return typeof translation === 'function' ? translation(...values) : translation;
}

function showNotice(key, values = [], tone = '') {
  notice = { key, values, tone };
  renderNotice();
}

function renderNotice() {
  element('feedback').textContent = text(notice.key, ...notice.values);
  element('feedback').className = `feedback ${notice.tone}`;
}

function changeLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language;
  document.title = text('title');
  document.querySelector('meta[name="description"]').content = text('description');
  document.querySelectorAll('[data-i18n]').forEach(node => {
    node.textContent = text(node.dataset.i18n);
  });
  document.querySelectorAll('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', button.dataset.language === language);
  });
  element('language-switch').setAttribute('aria-label', text('language'));
  chart.setAttribute('aria-label', text('chart'));

  try {
    localStorage.setItem('sort-language', language);
  } catch {
    // The toggle also works when browser storage is unavailable.
  }

  render();
}

function startRound(newNumbers = true) {
  if (newNumbers) originalNumbers = generateNumbers(Number(element('size').value));
  round = createSteps(originalNumbers, element('algorithm').value);
  stepIndex = 0;
  selected = null;
  draggedIndex = null;
  showNotice('howToSwap');
  render();
}

function chooseBar(index) {
  if (stepIndex === round.steps.length) return;

  if (selected === null) {
    selected = index;
    showNotice('chooseOther');
  } else if (selected === index) {
    selected = null;
    showNotice('howToSwap');
  } else {
    attemptSwap(selected, index);
    return;
  }

  renderBars();
}

function attemptSwap(first, second) {
  const step = round.steps[stepIndex];
  if (!step) return;

  selected = null;
  if (isCorrectMove(step, first, second)) {
    advance();
  } else {
    const bubble = element('algorithm').value === 'bubble';
    showNotice(bubble ? 'wrongBubble' : 'wrongSelection', [], 'error');
    renderBars();
  }
}

function advance() {
  stepIndex++;
  selected = null;
  showNotice(stepIndex === round.steps.length ? 'complete' : 'correct', [], 'success');
  render();
}

function createBar(index) {
  const bar = document.createElement('button');
  bar.type = 'button';
  bar.className = 'bar';

  const value = document.createElement('span');
  value.className = 'bar-value';
  bar.append(value);

  bar.addEventListener('click', () => chooseBar(index));
  bar.addEventListener('dragstart', event => {
    draggedIndex = index;
    event.dataTransfer.setData('text/plain', String(index));
    event.dataTransfer.effectAllowed = 'move';
  });
  bar.addEventListener('dragover', event => event.preventDefault());
  bar.addEventListener('drop', event => {
    event.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      attemptSwap(draggedIndex, index);
    }
    draggedIndex = null;
  });
  bar.addEventListener('dragend', () => { draggedIndex = null; });

  return bar;
}

function renderBars() {
  const step = round.steps[stepIndex];
  const complete = !step;
  const numbers = complete ? round.result : step.numbers;
  const bubble = element('algorithm').value === 'bubble';
  const maximum = Math.max(...numbers);
  const focusedBar = chart.contains(document.activeElement) ? document.activeElement : null;

  // Reuse the buttons so keyboard focus survives each decision.
  if (chart.children.length !== numbers.length) {
    chart.replaceChildren(...numbers.map((_, index) => createBar(index)));
  }

  numbers.forEach((value, index) => {
    const bar = chart.children[index];
    const sorted = complete || (bubble ? index >= step.sortedFrom : index < step.sortedFrom);
    const current = !complete && (index === step.left || (bubble && index === step.right));
    const label = [text('barLabel', index + 1, value)];
    if (sorted) label.push(text('sorted'));
    if (current) label.push(text('current'));

    bar.classList.toggle('sorted', sorted);
    bar.classList.toggle('current', current);
    bar.classList.toggle('selected', selected === index);
    bar.style.height = `${value / maximum * 90}%`;
    bar.firstElementChild.textContent = value;
    bar.setAttribute('aria-label', label.join(', '));
    bar.setAttribute('aria-pressed', selected === index);
    bar.draggable = !sorted;
    bar.disabled = sorted;
  });

  if (focusedBar?.disabled) {
    const nextControl = chart.querySelector('.current') ?? element('no-swap');
    nextControl.focus();
  }
}

function render() {
  const complete = stepIndex === round.steps.length;
  const algorithm = element('algorithm').value;
  element('instruction').textContent = text(complete ? 'done' : `${algorithm}Instruction`);
  element('rule').textContent = complete ? '' : text(`${algorithm}Rule`);
  element('no-swap').textContent = text(complete ? 'playAgain' : 'keepOrder');
  element('hint').hidden = complete;
  renderBars();
  renderNotice();
}

element('no-swap').addEventListener('click', () => {
  const step = round.steps[stepIndex];
  if (!step) return startRound();
  selected = null;
  if (!step.swap) return advance();
  showNotice('swapNeeded', [], 'error');
  renderBars();
});

element('hint').addEventListener('click', () => {
  const step = round.steps[stepIndex];
  if (!step) return;
  if (step.swap) {
    showNotice('swapHint', [step.numbers[step.left], step.numbers[step.right]]);
  } else {
    showNotice('noSwapHint');
  }
});

element('new-set').addEventListener('click', () => startRound());
element('size').addEventListener('change', () => startRound());
element('algorithm').addEventListener('change', () => startRound(false));
document.querySelectorAll('[data-language]').forEach(button => {
  button.addEventListener('click', () => changeLanguage(button.dataset.language));
});

startRound();
changeLanguage(language);

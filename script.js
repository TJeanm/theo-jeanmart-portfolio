const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const stage = document.getElementById('stage');
const figures = [...document.querySelectorAll('.side-figure')];
const interests = [...document.querySelectorAll('.interest')];
const interestSection = document.getElementById('interests');
const dialogTriggers = [...document.querySelectorAll('[data-dialog]')];

function placeFigures() {
  if (!stage) return;
  const stageTop = stage.getBoundingClientRect().top;
  for (const figure of figures) {
    const anchor = document.getElementById(figure.dataset.anchor);
    if (!anchor) continue;
    const top = anchor.getBoundingClientRect().top - stageTop + Number(figure.dataset.offset || 0);
    figure.style.top = top + 'px';
  }
}

let scrollQueued = false;
function updateScrollMotion() {
  scrollQueued = false;
  if (motionPreference.matches) return;
  const viewportMiddle = window.innerHeight * 0.56;
  for (const figure of figures) {
    const anchor = document.getElementById(figure.dataset.anchor);
    if (!anchor) continue;
    const topInViewport = anchor.getBoundingClientRect().top + Number(figure.dataset.offset || 0);
    const progress = Math.max(-1.4, Math.min(1.4, (viewportMiddle - topInViewport) / window.innerHeight));
    let x = 0, y = 0, rotation = 0;
    switch (figure.dataset.motion) {
      case 'cloud':
        rotation = progress * 22;
        break;
      case 'arm':
        figure.style.setProperty('--gripper-roll', (progress * 45) + 'deg');
        break;
      case 'formula':
        x = -progress * 34;
        figure.style.setProperty('--wheel-turn', (-window.scrollY * 1.05) + 'deg');
        break;
      case 'drone':
        x = progress * 28;
        y = progress * -9;
        figure.style.setProperty('--rotor-turn', (window.scrollY * 2.2) + 'deg');
        figure.style.setProperty('--rotor-turn-reverse', (-window.scrollY * 2.2) + 'deg');
        break;
    }
    figure.style.setProperty('--move-x', x + 'px');
    figure.style.setProperty('--move-y', y + 'px');
    figure.style.setProperty('--turn', rotation + 'deg');
  }
}

for (const item of dialogTriggers) {
  const dialog = document.getElementById(item.dataset.dialog);
  if (!dialog) continue;
  let openedByKeyboard = false;
  const openDialog = fromKeyboard => {
    openedByKeyboard = fromKeyboard;
    if (!dialog.open) dialog.showModal();
  };
  item.addEventListener('click', () => openDialog(false));
  item.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDialog(true);
    }
  });
  dialog.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    if (openedByKeyboard) item.focus({preventScroll:true});
    else item.blur();
  });
}

function queueScrollMotion() {
  if (!scrollQueued) {
    scrollQueued = true;
    requestAnimationFrame(updateScrollMotion);
  }
}

for (const item of interests) {
  item.addEventListener('toggle', () => {
    if (item.open) interests.forEach(other => { if (other !== item) other.open = false; });
  });
}

if (interestSection && !motionPreference.matches) {
  interestSection.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const bounds = interestSection.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    for (const item of interests) {
      const factor = Number(item.dataset.follow || 1);
      const image = item.querySelector('img');
      image.style.setProperty('--follow-x', (x * 22 * factor).toFixed(1) + 'px');
      image.style.setProperty('--follow-y', (y * 18 * factor).toFixed(1) + 'px');
      image.style.setProperty('--follow-r', (x * 6 * factor).toFixed(1) + 'deg');
    }
  });
  interestSection.addEventListener('pointerleave', () => {
    for (const item of interests) {
      const image = item.querySelector('img');
      image.style.setProperty('--follow-x', '0px');
      image.style.setProperty('--follow-y', '0px');
      image.style.setProperty('--follow-r', '0deg');
    }
  });
}

window.addEventListener('resize', () => { placeFigures(); queueScrollMotion(); }, {passive:true});
window.addEventListener('scroll', queueScrollMotion, {passive:true});
window.addEventListener('load', () => { placeFigures(); queueScrollMotion(); });
placeFigures();
queueScrollMotion();

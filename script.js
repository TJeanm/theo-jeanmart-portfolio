const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const stage = document.getElementById('stage');
const figures = [...document.querySelectorAll('.side-figure')];
const projectPanels = [...document.querySelectorAll('.project')];
const interests = [...document.querySelectorAll('.interest')];
const interestSection = document.getElementById('interests');

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
        y = progress * -20;
        rotation = progress * 35;
        break;
      case 'arm':
        y = progress * -24;
        rotation = progress * -12;
        break;
      case 'formula':
        x = progress * 27;
        figure.style.setProperty('--wheel-turn', (window.scrollY * 0.42) + 'deg');
        break;
      case 'drone':
        y = progress * -38;
        rotation = progress * 7;
        break;
    }
    figure.style.setProperty('--move-x', x + 'px');
    figure.style.setProperty('--move-y', y + 'px');
    figure.style.setProperty('--turn', rotation + 'deg');
  }
}

function queueScrollMotion() {
  if (!scrollQueued) {
    scrollQueued = true;
    requestAnimationFrame(updateScrollMotion);
  }
}

for (const panel of projectPanels) {
  panel.addEventListener('toggle', () => {
    if (panel.open) projectPanels.forEach(other => { if (other !== panel) other.open = false; });
  });
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

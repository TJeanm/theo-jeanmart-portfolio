const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const stage = document.getElementById('stage');
const figures = [...document.querySelectorAll('.side-figure')];
const projectPanels = [...document.querySelectorAll('.project')];
const interests = [...document.querySelectorAll('.interest')];
const interestSection = document.getElementById('interests');
const experienceItems = [...document.querySelectorAll('.experience-item[data-dialog]')];

function drawPointCloud() {
  const canvas = document.getElementById('point-cloud');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  let seed = 4815;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 640; i++) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * 116;
    const depth = (random() - 0.5) * 90;
    const x = 160 + Math.cos(angle) * radius * (0.77 + depth / 500) + depth * 0.18;
    const y = 160 + Math.sin(angle) * radius * 0.72 + depth * 0.48;
    const size = 0.55 + random() * 1.45;
    context.fillStyle = `rgba(38, 49, 55, ${0.26 + random() * 0.52})`;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  }
}

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
        rotation = window.scrollY * 0.16;
        break;
      case 'arm':
        figure.style.setProperty('--gripper-turn', (window.scrollY * 0.42) + 'deg');
        break;
      case 'formula':
        x = progress * 27;
        figure.style.setProperty('--wheel-turn', (window.scrollY * 0.42) + 'deg');
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

for (const item of experienceItems) {
  const dialog = document.getElementById(item.dataset.dialog);
  if (!dialog) continue;
  const openDialog = () => { if (!dialog.open) dialog.showModal(); };
  item.addEventListener('click', openDialog);
  item.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDialog();
    }
  });
  dialog.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => item.focus({preventScroll:true}));
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
drawPointCloud();
placeFigures();
queueScrollMotion();

const sections     = Array.from(document.querySelectorAll('.section'));
const totalSections = sections.length;
const slider        = document.getElementById('slider');
const background    = document.getElementById('background');
const toTopBtn      = document.getElementById('to-top');
let currentIndex    = 0;
let isAnimating     = false;

//SCROLLING
function scrollToSection(i) {
  slider.style.transform     = `translateY(-${i * 100}vh)`;
  background.style.transform = `translateY(-${i * 20}vh)`;
}

function updateToTopVisibility() {
  toTopBtn.style.display = currentIndex > 0 ? 'block' : 'none';
}

window.addEventListener('wheel', e => {
  if (isAnimating) return;
  const threshold = 30;
  let moved = false;

  if (e.deltaY > threshold && currentIndex < totalSections - 1) {
    currentIndex++; moved = true;
  } else if (e.deltaY < -threshold && currentIndex > 0) {
    currentIndex--; moved = true;
  }

  if (!moved) return;
  isAnimating = true;
  updateToTopVisibility();
  scrollToSection(currentIndex);

  setTimeout(() => {
    isAnimating = false;
    updateConnectors();
  }, 1000);
});

// SVG LINES
function updateConnectors() {
  sections.forEach(section => {
    const svg = section.querySelector('.connector-svg');
    if (!svg) return; // skip welcome

    svg.innerHTML = '';
    const rect    = section.getBoundingClientRect();
    const centerX = rect.width / 2;

    // draw stem
    const vLine = document.createElementNS(svg.namespaceURI, 'line');
    vLine.setAttribute('x1', centerX);
    vLine.setAttribute('y1', 0);
    vLine.setAttribute('x2', centerX);
    vLine.setAttribute('y2', rect.height);
    vLine.setAttribute('stroke', 'saddlebrown');
    vLine.setAttribute('stroke-opacity', 0.8);
    vLine.setAttribute('stroke-width', 12);
    svg.appendChild(vLine);

    // draw leaves
    section.querySelectorAll('.bubble.minor').forEach(bubble => {
      const bRect       = bubble.getBoundingClientRect();
      const sRect       = section.getBoundingClientRect();
      const y           = (bRect.top - sRect.top) + bRect.height / 2;
      const bubbleEdgeX = bubble.classList.contains('left')
                        ? bRect.right - sRect.left
                        : bRect.left  - sRect.left;
      const dx          = bubbleEdgeX - centerX;
      const leafHeight  = 35;

      const cp1x = dx * 0.25, cp1y = -leafHeight;
      const cp2x = dx * 0.75, cp2y = -leafHeight;
      const cp3x = dx * 0.75, cp3y =  leafHeight;
      const cp4x = dx * 0.25, cp4y =  leafHeight;

      const d = `
        M 0,0
        C ${cp1x},${cp1y} ${cp2x},${cp2y} ${dx},0
        C ${cp3x},${cp3y} ${cp4x},${cp4y} 0,0
        Z
      `.trim();

      const leaf = document.createElementNS(svg.namespaceURI, 'path');
      leaf.setAttribute('d', d);
      leaf.setAttribute('fill', 'rgba(34,139,34,1)');
      leaf.setAttribute('transform', `translate(${centerX}, ${y})`);
      svg.appendChild(leaf);
    });
  });
}

// Startup and resize
function resetToWelcome() {
  currentIndex = 0;
  slider.style.transform     = `translateY(0)`;
  background.style.transform = `translateY(0)`;
  updateConnectors();
  updateToTopVisibility();
}

window.addEventListener('load', resetToWelcome);
window.addEventListener('resize', resetToWelcome);

//To top button
toTopBtn.addEventListener('click', () => {
  if (isAnimating) return;
  currentIndex = 0;
  isAnimating  = true;
  scrollToSection(0);
  updateToTopVisibility();

  setTimeout(() => {
    isAnimating = false;
    updateConnectors();
  }, 1000);
});

//IMAGES
const overlay       = document.getElementById('detail-overlay');
const overlayImage  = document.getElementById('overlay-image');
const overlayTitle  = document.getElementById('overlay-title');
const overlayText   = document.getElementById('overlay-text');
const closeBtn      = document.getElementById('overlay-close');

sections.forEach((section, idx) => {
  if (!section.querySelector('.connector-svg')) return;

  section.querySelectorAll('.bubble.minor').forEach(bubble => {
    bubble.addEventListener('focus', () => {
      currentIndex = idx;
      scrollToSection(idx);
      updateToTopVisibility();
      updateConnectors();
      overlay.classList.add('visible');

      overlayTitle.textContent = bubble.querySelector('h3').textContent;
      overlayText.textContent  = bubble.querySelector('p').textContent;
      overlayImage.src         = bubble.dataset.image || '';
      overlayImage.alt         = bubble.dataset.imageAlt || '';
      overlay.style.display    = 'flex';
    });
  });
});

closeBtn.addEventListener('click', () => {
  overlay.style.display    = 'none';
  overlay.classList.remove('visible');
  document.activeElement.blur();
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.style.display === 'flex') {
    overlay.classList.remove('visible');
    overlay.style.display    = 'none';
    document.activeElement.blur();
  }
});

// script.js

// 1. Grab all .section elements in document order
const sections = Array.from(document.querySelectorAll('.section'));
const totalSections = sections.length;

// 2. Grab slider & background
const slider = document.getElementById('slider');
const background = document.getElementById('background');

// 3. Scroll & Parallax function
let currentIndex = 0;
let isAnimating  = false;
function scrollToSection(i) {
  slider.style.transform     = `translateY(-${i * 100}vh)`;
  background.style.transform = `translateY(-${i * 20}vh)`;
}

// helper to show/hide
function updateToTopVisibility() {
    if (currentIndex > 0) {
      toTopBtn.style.display = 'block';
    } else {
      toTopBtn.style.display = 'none';
    }
  }

// 4. Wheel listener with resistance
window.addEventListener('wheel', e => {
  if (isAnimating) return;
  const threshold = 30;
  if (e.deltaY > threshold && currentIndex < totalSections - 1) {
    currentIndex++;
  } else if (e.deltaY < -threshold && currentIndex > 0) {
    currentIndex--;
  } else {
    return;
  }
  isAnimating = true;
  updateToTopVisibility();
  scrollToSection(currentIndex);
  setTimeout(() => {
    isAnimating = false;
    updateConnectors();
  }, 1000);
});

// 5. Connector‑drawing function
function updateConnectors() {
  sections.forEach(section => {
    const svg = section.querySelector('.connector-svg');
    if (!svg) return; // skip welcome section

    // clear old
    svg.innerHTML = '';

    const rect    = section.getBoundingClientRect();
    const centerX = rect.width / 2;

    // vertical line
    const vLine = document.createElementNS(svg.namespaceURI, 'line');
    vLine.setAttribute('x1', centerX);
    vLine.setAttribute('y1', 0);
    vLine.setAttribute('x2', centerX);
    vLine.setAttribute('y2', rect.height);
    vLine.setAttribute('stroke', 'red');
    vLine.setAttribute('stroke-opacity', 0.8);   // 0.0–1.0 for transparency
    vLine.setAttribute('stroke-width', 6);       // thicker than 4    
    svg.appendChild(vLine);

    // minor connectors
    section.querySelectorAll('.bubble.minor').forEach(bubble => {
      const bRect = bubble.getBoundingClientRect();
      const sRect = section.getBoundingClientRect();
      const startY = (bRect.top - sRect.top) + bRect.height / 2;
      let startX, controlX;

      if (bubble.classList.contains('left')) {
        startX   = bRect.right - sRect.left;
        controlX = (startX + centerX) / 2 - 20;
      } else {
        startX   = bRect.left - sRect.left;
        controlX = (startX + centerX) / 2 + 20;
      }

      const controlY = startY - 10;
      const endX     = centerX;
      const endY     = startY;

      const path = document.createElementNS(svg.namespaceURI, 'path');
      path.setAttribute('d', `M${startX},${startY} Q${controlX},${controlY} ${endX},${endY}`);
      path.setAttribute('stroke', 'red');
      path.setAttribute('stroke-opacity', 0.8);
      path.setAttribute('stroke-width', 5);
      path.setAttribute('fill', 'none');
      svg.appendChild(path);

      const dot = document.createElementNS(svg.namespaceURI, 'circle');
      dot.setAttribute('cx', endX);
      dot.setAttribute('cy', endY);
      dot.setAttribute('r', 10);                       // radius in pixels
      dot.setAttribute('fill', '#000');                // solid black
      svg.appendChild(dot);



    });
  });
}

// 6. Initial and resize hook
window.addEventListener('load', () => {
    updateConnectors();
    updateToTopVisibility();
  });
  window.addEventListener('resize', () => {
    updateConnectors();
    updateToTopVisibility();
  });

// Return to Top button behavior
const toTopBtn = document.getElementById('to-top');
toTopBtn.addEventListener('click', () => {
  if (isAnimating) return;
  // Jump back to the first section
  currentIndex = 0;
  isAnimating = true;
  scrollToSection(currentIndex);
  // After the slide animation finishes, re-enable scrolling and redraw connectors
  updateToTopVisibility();
  setTimeout(() => {
    isAnimating = false;
    updateConnectors();
  }, 1000);
});

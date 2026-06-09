/**
 * Exclusive Privileges Carousel
 * Pure JS — matches ICICI Bank original
 * Uses pixel-based left positioning + rotateY for 3D tilt
 */

document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('carouselStage');
  const slides = Array.from(stage.querySelectorAll('.carousel-slide'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const totalSlides = slides.length;
  let currentIndex = 2; // BookMyShow centered
  let isAnimating = false;
  let startX = 0;
  let isDragging = false;

  function layoutSlides(direction = 0) {
    const stageW = stage.offsetWidth;
    const cardW = Math.min(stageW * 0.36, 530);
    const centerLeft = (stageW - cardW) / 2;

    const R = cardW * 1.6; // Circle radius
    const theta = 35; // Separation angle in degrees

    slides.forEach((slide, index) => {
      let rel = index - currentIndex;
      if (rel > totalSlides / 2) rel -= totalSlides;
      if (rel < -totalSlides / 2) rel += totalSlides;

      slide.style.width = cardW + 'px';
      slide.style.left = centerLeft + 'px'; // All cards centered horizontally
      slide.classList.remove('active');

      if (rel === 0) {
        slide.style.transform = `translateZ(${-R}px) rotateY(0deg) translateZ(${R}px) scale(1)`;
        slide.style.opacity = '1';
        slide.style.zIndex = '3';
        slide.classList.add('active');
      } else if (rel === -1) {
        slide.style.transform = `translateZ(${-R}px) rotateY(-${theta}deg) translateZ(${R}px) scale(0.85)`;
        slide.style.opacity = '1';
        slide.style.zIndex = '2';
      } else if (rel === 1) {
        slide.style.transform = `translateZ(${-R}px) rotateY(${theta}deg) translateZ(${R}px) scale(0.85)`;
        slide.style.opacity = '1';
        slide.style.zIndex = '2';
      } else {
        // HIDDEN
        let dir = rel > 0 ? 1 : -1;
        
        // Override dir during animation so the card leaving the screen goes further in its current direction
        if (direction === 1) dir = -1; // Next: Left card goes to Left-Hidden
        if (direction === -1) dir = 1; // Prev: Right card goes to Right-Hidden
        
        slide.style.transform = `translateZ(${-R}px) rotateY(${dir * 80}deg) translateZ(${R}px) scale(0.7)`;
        slide.style.opacity = '0';
        slide.style.zIndex = '0';
      }
    });
  }

  function teleportHiddenCard(targetDir) {
    // The currently hidden card is at (currentIndex + 2) % 4
    const hiddenCardIndex = (currentIndex + 2) % totalSlides;
    const hiddenCard = slides[hiddenCardIndex];
    
    hiddenCard.style.transition = 'none';
    
    const stageW = stage.offsetWidth;
    const cardW = Math.min(stageW * 0.36, 530);
    const centerLeft = (stageW - cardW) / 2;
    const R = cardW * 1.6;
    
    hiddenCard.style.left = centerLeft + 'px';
    hiddenCard.style.transform = `translateZ(${-R}px) rotateY(${targetDir * 80}deg) translateZ(${R}px) scale(0.7)`;
    
    // Force reflow
    void hiddenCard.offsetWidth;
    hiddenCard.style.transition = '';
  }

  function nextSlide() {
    if (isAnimating) return;
    isAnimating = true;

    // Teleport current hidden card to Right-Hidden so it can enter smoothly
    teleportHiddenCard(1);

    currentIndex = (currentIndex + 1) % totalSlides;
    layoutSlides(1); // Pass direction = 1
    setTimeout(() => { isAnimating = false; }, 550);
  }

  function prevSlide() {
    if (isAnimating) return;
    isAnimating = true;

    // Teleport current hidden card to Left-Hidden so it can enter smoothly
    teleportHiddenCard(-1);

    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    layoutSlides(-1); // Pass direction = -1
    setTimeout(() => { isAnimating = false; }, 550);
  }

  // Buttons
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    else if (e.key === 'ArrowRight') nextSlide();
  });

  // Touch
  stage.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
  });

  // Mouse drag
  stage.addEventListener('mousedown', (e) => { startX = e.clientX; isDragging = true; e.preventDefault(); });
  stage.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
  });
  stage.addEventListener('mouseleave', () => { isDragging = false; });

  // Resize
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(layoutSlides, 150); });

  // Init
  layoutSlides();
});

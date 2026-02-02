const AUTOPLAY_INTERVAL = 5000; // 5 seconds between slides

// Default labels (no placeholders dependency)
const labels = {
  carousel: 'Carousel',
  pause: 'Pause',
  play: 'Play',
  carouselSlideControls: 'Carousel Slide Controls',
  previousSlide: 'Previous Slide',
  nextSlide: 'Next Slide',
  showSlide: 'Show Slide',
  of: 'of',
};

// Helper function for instrumentation
function moveInstrumentation(from, to) {
  [...from.attributes].forEach((attr) => {
    if (attr.name.startsWith('data-aue-') || attr.name.startsWith('data-richtext-')) {
      to.setAttribute(attr.name, attr.value);
    }
  });
}

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-va-news');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-va-news-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-va-news-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-va-news-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  
  const slidesContainer = block.querySelector('.carousel-va-news-slides');
  slidesContainer.scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
  
  // Update active slide indicators
  updateActiveSlide(activeSlide);
}

function startAutoplay(block) {
  if (block.autoplayInterval) return; // Already running

  block.autoplayInterval = setInterval(() => {
    const currentSlide = parseInt(block.dataset.activeSlide, 10);
    showSlide(block, currentSlide + 1);
  }, AUTOPLAY_INTERVAL);

  block.dataset.autoplayRunning = 'true';
}

function stopAutoplay(block) {
  if (block.autoplayInterval) {
    clearInterval(block.autoplayInterval);
    block.autoplayInterval = null;
  }
  block.dataset.autoplayRunning = 'false';
}

function updatePlayPauseButton(block, isPlaying) {
  const playBtn = block.querySelector('.carousel-va-news-play');
  const pauseBtn = block.querySelector('.carousel-va-news-pause');

  if (playBtn && pauseBtn) {
    // Always show both buttons
    playBtn.style.display = 'inline-flex';
    pauseBtn.style.display = 'inline-flex';
    playBtn.setAttribute('aria-hidden', 'false');
    pauseBtn.setAttribute('aria-hidden', 'false');
    
    // Just update which one is disabled/active
    if (isPlaying) {
      playBtn.setAttribute('disabled', 'true');
      pauseBtn.removeAttribute('disabled');
    } else {
      playBtn.removeAttribute('disabled');
      pauseBtn.setAttribute('disabled', 'true');
    }
  }
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-va-news-slide-indicators');
  
  if (!slideIndicators) {
    return;
  }

  const buttons = slideIndicators.querySelectorAll('button');
  
  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      const targetSlide = parseInt(slideIndicator.dataset.targetSlide, 10);
      showSlide(block, targetSlide);
    });
  });

  const prevBtn = block.querySelector('.slide-prev');
  const nextBtn = block.querySelector('.slide-next');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    });
  }

  // Play/Pause button events
  const playBtn = block.querySelector('.carousel-va-news-play');
  const pauseBtn = block.querySelector('.carousel-va-news-pause');

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      startAutoplay(block);
      updatePlayPauseButton(block, true);
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      stopAutoplay(block);
      updatePlayPauseButton(block, false);
    });
  }

  // Pause on hover/focus for accessibility
  block.addEventListener('mouseenter', () => {
    if (block.dataset.autoplayRunning === 'true') {
      stopAutoplay(block);
      block.dataset.autoplayPaused = 'true';
    }
  });

  block.addEventListener('mouseleave', () => {
    if (block.dataset.autoplayPaused === 'true') {
      startAutoplay(block);
      block.dataset.autoplayPaused = 'false';
    }
  });

  block.addEventListener('focusin', () => {
    if (block.dataset.autoplayRunning === 'true') {
      stopAutoplay(block);
      block.dataset.autoplayPaused = 'true';
    }
  });

  block.addEventListener('focusout', (e) => {
    if (!block.contains(e.relatedTarget) && block.dataset.autoplayPaused === 'true') {
      startAutoplay(block);
      block.dataset.autoplayPaused = 'false';
    }
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-va-news-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-va-news-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-va-news-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-va-news-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-va-news-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', labels.carousel);

  const container = document.createElement('div');
  container.classList.add('carousel-va-news-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-va-news-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    // Add play/pause controls
    const playPauseControls = document.createElement('div');
    playPauseControls.classList.add('carousel-va-news-controls');
    playPauseControls.innerHTML = `
      <button type="button" class="carousel-va-news-pause" aria-label="${labels.pause}" aria-hidden="false">
        <span class="carousel-va-news-pause-icon"></span>
      </button>
      <button type="button" class="carousel-va-news-play" aria-label="${labels.play}" aria-hidden="false">
        <span class="carousel-va-news-play-icon"></span>
      </button>
    `;
    container.append(playPauseControls);

    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', labels.carouselSlideControls);
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-va-news-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-va-news-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${labels.previousSlide}"></button>
      <button type="button" class="slide-next" aria-label="${labels.nextSlide}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      // Extract title from slide for the indicator button
      const slideTitle = slide.querySelector('h2')?.textContent || `Slide ${idx + 1}`;
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-va-news-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${labels.showSlide} ${idx + 1} ${labels.of} ${rows.length}">${slideTitle}</button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    block.dataset.activeSlide = 0;
    bindEvents(block);
    startAutoplay(block);
    updatePlayPauseButton(block, true);
    
    // Set initial active state
    const firstSlide = block.querySelector('.carousel-va-news-slide');
    if (firstSlide) {
      updateActiveSlide(firstSlide);
    }
  }
}

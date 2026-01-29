// Slider VA Stories - Simple story carousel for Inside Veterans Health section
export default function decorate(block) {
  const stories = [...block.children];
  if (stories.length === 0) return;

  let currentSlide = 0;

  // Create wrapper structure
  const wrapper = document.createElement('div');
  wrapper.className = 'slider-va-stories-wrapper';

  // Create header with links
  const header = document.createElement('div');
  header.className = 'slider-va-stories-header';
  header.innerHTML = `
    <h3>Inside Veterans Health</h3>
    <div class="slider-va-stories-links">
      <a href="https://news.va.gov/category/inside-veterans-health/feed/" target="_blank">RSS</a>
      <span>|</span>
      <a href="https://public.govdelivery.com/accounts/USVHA/subscriber/new?topic_id=USVHA_49" target="_blank">Subscribe</a>
      <span>|</span>
      <a href="https://www.va.gov/health/InsideVHA.asp" target="_blank">Archive</a>
    </div>
  `;
  wrapper.appendChild(header);

  // Create slides container
  const slidesContainer = document.createElement('div');
  slidesContainer.className = 'slider-va-stories-slides';

  // Process each story into a slide
  stories.forEach((story, idx) => {
    const slide = document.createElement('div');
    slide.className = 'slider-va-stories-slide';
    slide.dataset.slideIndex = idx;

    const imageCol = story.querySelector(':scope > div:first-child');
    const contentCol = story.querySelector(':scope > div:last-child');

    if (imageCol) {
      imageCol.className = 'slider-va-stories-slide-image';
      slide.appendChild(imageCol);
    }

    if (contentCol) {
      contentCol.className = 'slider-va-stories-slide-content';
      // Add "Read the full story..." link styling
      const links = contentCol.querySelectorAll('a');
      links.forEach((link) => {
        if (!link.querySelector('em')) {
          const em = document.createElement('em');
          em.textContent = link.textContent;
          link.textContent = '';
          link.appendChild(em);
        }
      });
      slide.appendChild(contentCol);
    }

    slide.setAttribute('aria-hidden', idx !== 0);
    slidesContainer.appendChild(slide);
    story.remove();
  });

  wrapper.appendChild(slidesContainer);

  // Create navigation
  const nav = document.createElement('div');
  nav.className = 'slider-va-stories-nav';
  nav.innerHTML = `
    <div class="slider-va-stories-counter">
      <span class="current">1</span> of <span class="total">${stories.length}</span>
      <button type="button" class="slider-va-stories-prev" aria-label="Previous">Previous</button>
      <span>|</span>
      <button type="button" class="slider-va-stories-next" aria-label="Next">Next</button>
    </div>
    <a href="https://www.va.gov/health/InsideVHA.asp" class="slider-va-stories-more">More Stories</a>
  `;
  wrapper.appendChild(nav);

  // Navigation functions
  const showSlide = (index) => {
    const slides = slidesContainer.querySelectorAll('.slider-va-stories-slide');
    let newIndex = index;
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;

    slides.forEach((slide, idx) => {
      slide.setAttribute('aria-hidden', idx !== newIndex);
    });

    currentSlide = newIndex;
    nav.querySelector('.current').textContent = newIndex + 1;
  };

  nav.querySelector('.slider-va-stories-prev').addEventListener('click', () => {
    showSlide(currentSlide - 1);
  });

  nav.querySelector('.slider-va-stories-next').addEventListener('click', () => {
    showSlide(currentSlide + 1);
  });

  block.textContent = '';
  block.appendChild(wrapper);
}

/**
 * Parser for carousel-va-news block
 * Converts VA.gov slider/carousel elements to AEM carousel block format
 *
 * Expected input: Slider container with rotating slides
 * Output: 2-column table with [image | content] per slide
 */

export const name = 'Carousel-Va-News';

export function parse(element, document) {
  const cells = [];

  // Add block header
  cells.push([name]);

  // Find all slides
  const slides = element.querySelectorAll('.slide, .slider-item, [class*="slide"]');

  if (slides.length === 0) {
    // Try alternative structure - look for direct children
    const items = element.querySelectorAll(':scope > div, :scope > li');
    items.forEach(item => {
      const row = parseSlide(item, document);
      if (row) cells.push(row);
    });
  } else {
    slides.forEach(slide => {
      const row = parseSlide(slide, document);
      if (row) cells.push(row);
    });
  }

  return cells;
}

function parseSlide(slide, document) {
  // Find image
  const img = slide.querySelector('img');
  const imgCell = img ? img.cloneNode(true) : '';

  // Find content (title, description, link)
  const title = slide.querySelector('h2, h3, .title, .slide-title');
  const desc = slide.querySelector('p, .description, .slide-desc');
  const link = slide.querySelector('a');

  // Build content cell
  const contentDiv = document.createElement('div');

  if (title) {
    const h2 = document.createElement('h2');
    h2.textContent = title.textContent.trim();
    contentDiv.appendChild(h2);
  }

  if (desc) {
    const p = document.createElement('p');
    p.textContent = desc.textContent.trim();
    contentDiv.appendChild(p);
  }

  if (link) {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.textContent.trim() || 'Learn more';
    const p = document.createElement('p');
    p.appendChild(a);
    contentDiv.appendChild(p);
  }

  // Only return row if we have content
  if (imgCell || contentDiv.children.length > 0) {
    return [imgCell, contentDiv];
  }

  return null;
}

export function matches(element) {
  // Match slider/carousel containers
  const classMatch = element.className && (
    element.className.includes('slider') ||
    element.className.includes('carousel') ||
    element.className.includes('rotator')
  );

  const idMatch = element.id && (
    element.id.includes('slider') ||
    element.id.includes('carousel')
  );

  return classMatch || idMatch;
}

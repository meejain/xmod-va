/**
 * Parser for columns-va-banner block
 * Converts side-by-side layouts to AEM columns block format
 *
 * Expected input: Container with image and text side-by-side
 * Output: 2-column table with [image | content] or [content | content]
 */

export const name = 'Columns-Va-Banner';

export function parse(element, document) {
  const cells = [];

  // Add block header
  cells.push([name]);

  // Find column containers
  const columns = element.querySelectorAll(':scope > div, .column, .col, [class*="col-"]');

  if (columns.length >= 2) {
    // Multi-column layout
    const row = [];
    columns.forEach(col => {
      const colClone = col.cloneNode(true);
      cleanupColumn(colClone);
      row.push(colClone);
    });
    cells.push(row);
  } else {
    // Look for image + text pattern
    const img = element.querySelector('img');
    const textContent = element.querySelector('h2, h3, p');

    if (img && textContent) {
      const imgClone = img.cloneNode(true);

      // Build content cell
      const contentDiv = document.createElement('div');

      // Get all headings and paragraphs
      const headings = element.querySelectorAll('h2, h3, h4');
      const paragraphs = element.querySelectorAll('p');
      const links = element.querySelectorAll('a:not(img a)');

      headings.forEach(h => {
        const heading = document.createElement(h.tagName);
        heading.textContent = h.textContent.trim();
        contentDiv.appendChild(heading);
      });

      paragraphs.forEach(p => {
        const para = document.createElement('p');
        para.innerHTML = p.innerHTML;
        contentDiv.appendChild(para);
      });

      // Add standalone links
      links.forEach(link => {
        if (!contentDiv.querySelector(`a[href="${link.href}"]`)) {
          const a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.textContent.trim();
          const p = document.createElement('p');
          p.appendChild(a);
          contentDiv.appendChild(p);
        }
      });

      cells.push([imgClone, contentDiv]);
    }
  }

  return cells;
}

function cleanupColumn(element) {
  // Remove VA-specific classes
  const classes = Array.from(element.classList);
  classes.forEach(cls => {
    if (cls.startsWith('vads-') || cls.startsWith('usa-') || cls.includes('col-')) {
      element.classList.remove(cls);
    }
  });

  // Remove scripts and styles
  const scripts = element.querySelectorAll('script, style');
  scripts.forEach(s => s.remove());
}

export function matches(element) {
  // Match column/side-by-side layouts
  const classMatch = element.className && (
    element.className.includes('column') ||
    element.className.includes('two-col') ||
    element.className.includes('side-by-side') ||
    element.className.includes('banner')
  );

  // Check for image + text siblings pattern
  const hasImageAndText = element.querySelector('img') &&
    element.querySelector('h2, h3, p');

  return classMatch || hasImageAndText;
}

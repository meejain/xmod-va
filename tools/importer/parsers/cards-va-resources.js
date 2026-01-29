/**
 * Parser for cards-va-resources block (no images variant)
 * Converts VA.gov resource lists to AEM cards block format
 *
 * Expected input: List of resource links
 * Output: 1-column table with [title + description] per card
 */

export const name = 'Cards-Va-Resources';
export const variant = 'no images';

export function parse(element, document) {
  const cells = [];

  // Add block header with variant
  cells.push([`${name} (${variant})`]);

  // Find list items or link containers
  const items = element.querySelectorAll('li, .resource-item, .link-item, a.resource-link');

  items.forEach(item => {
    const link = item.querySelector('a') || (item.tagName === 'A' ? item : null);

    if (link) {
      const contentDiv = document.createElement('div');

      // Create title (bold link)
      const title = document.createElement('p');
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim();
      strong.appendChild(a);
      title.appendChild(strong);
      contentDiv.appendChild(title);

      // Look for description text
      const desc = item.querySelector('.description, .desc, small, span:not(:has(a))');
      if (desc && desc.textContent.trim() !== link.textContent.trim()) {
        const descP = document.createElement('p');
        descP.textContent = desc.textContent.trim();
        contentDiv.appendChild(descP);
      }

      cells.push([contentDiv]);
    }
  });

  // Alternative: Check for dl/dt/dd pattern
  if (cells.length <= 1) {
    const dts = element.querySelectorAll('dt');
    const dds = element.querySelectorAll('dd');

    for (let i = 0; i < dts.length; i++) {
      const contentDiv = document.createElement('div');

      const title = document.createElement('p');
      const strong = document.createElement('strong');
      const link = dts[i].querySelector('a');

      if (link) {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.textContent.trim();
        strong.appendChild(a);
      } else {
        strong.textContent = dts[i].textContent.trim();
      }
      title.appendChild(strong);
      contentDiv.appendChild(title);

      if (dds[i]) {
        const descP = document.createElement('p');
        descP.textContent = dds[i].textContent.trim();
        contentDiv.appendChild(descP);
      }

      cells.push([contentDiv]);
    }
  }

  return cells;
}

export function matches(element) {
  // Match resource lists
  const classMatch = element.className && (
    element.className.includes('resource') ||
    element.className.includes('link-list') ||
    element.className.includes('quick-links')
  );

  const isList = element.tagName === 'UL' || element.tagName === 'OL';
  const hasManyLinks = element.querySelectorAll('a').length >= 3;

  return classMatch || (isList && hasManyLinks);
}

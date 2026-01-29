/*
 * Accordion Block - VA Menu Variant
 * Left sidebar navigation menu with expandable sections
 * Supports 3-level nested accordions
 */

/**
 * Process a list of links and check for nested sub-items
 * @param {HTMLElement} container - The container with links
 * @param {number} level - Current nesting level (1, 2, or 3)
 */
function processNestedLinks(container, level = 2) {
  const ul = container.querySelector('ul');
  if (!ul) return;

  const items = [...ul.children];
  items.forEach((li) => {
    // Check if this item has a nested list (sub-accordion)
    const nestedUl = li.querySelector(':scope > ul');
    if (nestedUl && level < 3) {
      // This item has sub-items, make it an accordion
      // Get the label from the text content before the nested list
      let label = '';
      const childNodes = [...li.childNodes];
      for (const node of childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          if (text) {
            label = text;
            break;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'UL') {
          label = node.textContent.trim();
          break;
        }
      }
      if (!label) label = 'Item';

      // Create nested details/summary structure
      const details = document.createElement('details');
      details.className = `accordion-va-menu-nested accordion-va-menu-level-${level}`;

      const summary = document.createElement('summary');
      summary.className = 'accordion-va-menu-nested-label';
      summary.textContent = label;

      const body = document.createElement('div');
      body.className = 'accordion-va-menu-nested-body';

      // Move nested items to body
      const nestedItems = [...nestedUl.children];
      const newUl = document.createElement('ul');
      nestedItems.forEach((nestedLi) => {
        newUl.appendChild(nestedLi.cloneNode(true));
      });
      body.appendChild(newUl);

      details.appendChild(summary);
      details.appendChild(body);

      // Replace the li content
      li.innerHTML = '';
      li.appendChild(details);
      li.classList.add('accordion-va-menu-has-nested');

      // Recursively process deeper nesting
      processNestedLinks(body, level + 1);
    }
  });
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-va-menu-item-label';
    summary.append(...label.childNodes);

    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-va-menu-item-body';

    // Process nested links for sub-accordions
    processNestedLinks(body, 2);

    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-va-menu-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}

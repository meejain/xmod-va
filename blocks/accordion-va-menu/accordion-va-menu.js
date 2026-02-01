/*
 * Accordion Block - VA Menu Variant
 * Left sidebar navigation menu with expandable sections
 * Supports 3-level nested accordions
 */

// Tracker for all accordion instances
const tracker = [];

/**
 * Accordion class for smooth expand/collapse animations
 * Uses Web Animations API for seamless height transitions
 */
class Accordion {
  constructor(el, contentSelector = null) {
    // Store the <details> element
    this.el = el;
    // Store the <summary> element
    this.summary = el.querySelector('summary');
    // Store the parent <details> element
    this.parent = el.parentElement?.closest('details');
    // Store the content element (body of the accordion)
    // Use custom selector or default to first div after summary
    this.content = contentSelector
      ? el.querySelector(contentSelector)
      : el.querySelector('summary ~ div, summary ~ .accordion-va-menu-item-body, summary ~ .accordion-va-menu-nested-body');

    // Store the animation object (so we can cancel it if needed)
    this.animation = null;
    // Store if the element is closing
    this.isClosing = false;
    // Store if the element is expanding
    this.isExpanding = false;
    // Detect user clicks on the summary element
    this.summary.addEventListener('click', (e) => this.onClick(e));
  }

  onClick(e) {
    // Stop default behaviour from the browser
    e.preventDefault();
    // Add an overflow on the <details> to avoid content overflowing
    this.el.style.overflow = 'hidden';
    // Check if the element is being closed or is already closed
    if (this.isClosing || !this.el.open) {
      this.open();
      // Check if the element is being opened or is already open
    } else if (this.isExpanding || this.el.open) {
      this.shrink();
    }
  }

  shrink() {
    // Set the element as "being closed"
    this.isClosing = true;
    // Store the current height of the element
    const startHeight = `${this.el.offsetHeight}px`;
    // Calculate the height of the summary
    const endHeight = `${this.summary.offsetHeight}px`;
    // If there is already an animation running
    if (this.animation) {
      // Cancel the current animation
      this.animation.cancel();
    }
    // Start a WAAPI animation
    this.animation = this.el.animate({
      // Set the keyframes from the startHeight to endHeight
      height: [startHeight, endHeight],
    }, {
      duration: 300,
      easing: 'ease-out',
    });
    // When the animation is complete, call onAnimationFinish()
    this.animation.onfinish = () => this.onAnimationFinish(false);
    // If the animation is cancelled, isClosing variable is set to false
    // eslint-disable-next-line no-return-assign
    this.animation.oncancel = () => this.isClosing = false;
  }

  open() {
    // Apply a fixed height on the element
    this.el.style.height = `${this.el.offsetHeight}px`;
    // Force the [open] attribute on the details element
    this.el.open = true;
    // Wait for the next frame to call the expand function
    window.requestAnimationFrame(() => this.expand());
  }

  expand() {
    // Set the element as "being expanding"
    this.isExpanding = true;
    // Get the current fixed height of the element
    const startHeight = `${this.el.offsetHeight}px`;
    // Calculate the open height of the element (summary height + content height)
    const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;

    // If there is already an animation running
    if (this.animation) {
      // Cancel the current animation
      this.animation.cancel();
    }

    // Start a WAAPI animation
    this.animation = this.el.animate({
      // Set the keyframes from the startHeight to endHeight
      height: [startHeight, endHeight],
    }, {
      duration: 300,
      easing: 'ease-out',
    });
    // When the animation is complete, call onAnimationFinish()
    this.animation.onfinish = () => this.onAnimationFinish(true);
    // If the animation is cancelled, isExpanding variable is set to false
    // eslint-disable-next-line no-return-assign
    this.animation.oncancel = () => this.isExpanding = false;
  }

  onAnimationFinish(open) {
    // Set the open attribute based on the parameter
    this.el.open = open;
    // Clear the stored animation
    this.animation = null;
    // Reset isClosing & isExpanding
    this.isClosing = false;
    this.isExpanding = false;
    // Remove the overflow hidden and the fixed height
    this.el.style.height = '';
    this.el.style.overflow = '';
  }
}

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

  // Initialize smooth accordion animations for all details elements
  block.querySelectorAll('details').forEach((el) => {
    const detailObject = new Accordion(el);
    tracker.push(detailObject);
  });

  // Add click handlers to coordinate accordion behavior
  // Close sibling accordions when one opens (only at the same level)
  tracker.forEach((accordion) => {
    accordion.el.addEventListener('click', () => {
      tracker.forEach((otherAccordion) => {
        // Close other accordions that are:
        // 1. Not the clicked one
        // 2. Not a parent of the clicked one (to keep nested structure open)
        // 3. At the same level (siblings)
        if (otherAccordion !== accordion
          && !accordion.parent?.isSameNode(otherAccordion.el)
          && accordion.parent === otherAccordion.parent) {
          otherAccordion.shrink();
        }
      });
    });
  });
}

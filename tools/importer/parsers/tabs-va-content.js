/**
 * Parser for tabs-va-content block
 * Converts VA.gov tabbed content to AEM tabs block format
 *
 * Expected input: Tab container with tab buttons and panels
 * Output: 2-column table with [tab label | tab content] per tab
 */

export const name = 'Tabs-Va-Content';

export function parse(element, document) {
  const cells = [];

  // Add block header
  cells.push([name]);

  // Find tab buttons/labels
  const tabButtons = element.querySelectorAll('.tab-button, .tab-label, [role="tab"], .tabs li, .tab-nav a');

  // Find tab panels/content
  const tabPanels = element.querySelectorAll('.tab-panel, .tab-content, [role="tabpanel"], .tabs-content > div');

  // Match tabs with panels
  if (tabButtons.length > 0 && tabPanels.length > 0) {
    const minLength = Math.min(tabButtons.length, tabPanels.length);

    for (let i = 0; i < minLength; i++) {
      const label = tabButtons[i].textContent.trim();
      const contentClone = tabPanels[i].cloneNode(true);

      // Clean up panel content
      cleanupContent(contentClone);

      cells.push([label, contentClone]);
    }
  } else {
    // Alternative: look for data attributes or aria controls
    tabButtons.forEach(button => {
      const controlId = button.getAttribute('aria-controls') || button.getAttribute('data-target');
      const panel = controlId ? element.querySelector(`#${controlId}`) : null;

      if (panel) {
        const label = button.textContent.trim();
        const contentClone = panel.cloneNode(true);
        cleanupContent(contentClone);
        cells.push([label, contentClone]);
      }
    });
  }

  return cells;
}

function cleanupContent(element) {
  // Remove hidden/inactive classes
  element.classList.remove('hidden', 'inactive', 'tab-panel--hidden');
  element.removeAttribute('aria-hidden');
  element.removeAttribute('role');

  // Remove any script or style elements
  const scripts = element.querySelectorAll('script, style');
  scripts.forEach(s => s.remove());
}

export function matches(element) {
  // Match tab containers
  const classMatch = element.className && (
    element.className.includes('tab') ||
    element.className.includes('tabs')
  );

  const roleMatch = element.getAttribute('role') === 'tablist' ||
    element.querySelector('[role="tablist"]') !== null;

  return classMatch || roleMatch;
}

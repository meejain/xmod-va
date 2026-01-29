// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-va-content-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-va-content-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // Get the content div (second column)
    const contentDiv = tabpanel.lastElementChild;
    if (contentDiv) {
      contentDiv.className = 'tabs-va-content-panel-content';
    }

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-va-content-tab';
    button.id = `tab-${id}`;
    button.textContent = tab.textContent;

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);

  // Look for slider-va-stories block that follows and move it into the first tab panel (Health Care)
  const section = block.closest('.section');
  if (section) {
    const sliderBlock = section.querySelector('.slider-va-stories');
    if (sliderBlock) {
      const firstPanel = block.querySelector('[role=tabpanel]');
      if (firstPanel) {
        const panelContent = firstPanel.querySelector('.tabs-va-content-panel-content');
        if (panelContent) {
          // Move the slider into the first tab panel
          panelContent.appendChild(sliderBlock);
        }
      }
    }
  }
}

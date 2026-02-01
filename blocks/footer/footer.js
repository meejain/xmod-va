import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/content/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';

  // Create main footer container
  const footer = document.createElement('div');
  footer.classList.add('footer-wrapper');

  // Collect all paragraph, heading, and list elements from the fragment
  const allContent = [];

  // Get content from all default-content-wrappers
  const wrappers = fragment.querySelectorAll('.default-content-wrapper');

  wrappers.forEach((wrapper) => {
    allContent.push(...Array.from(wrapper.children));
  });

  // Variables to track sections
  let pactActBanner = null;
  let lastUpdated = null;
  const mainColumnsContent = [];
  let languageLabel = null;
  let languageLinks = null;
  let logoSection = null;
  let legalSection = null;

  // Parse content and categorize
  allContent.forEach((el) => {
    const text = el.textContent || '';

    // PACT Act Banner (paragraph with PACT Act link)
    if (el.tagName === 'P' && text.includes('PACT Act')) {
      pactActBanner = el.cloneNode(true);
      return;
    }

    // Last Updated
    if (el.tagName === 'P' && text.includes('Last updated:')) {
      lastUpdated = el.cloneNode(true);
      return;
    }

    // Language assistance label
    if (el.tagName === 'P' && text.trim() === 'Language assistance') {
      languageLabel = el.cloneNode(true);
      return;
    }

    // Language links (Español, Tagalog)
    if (el.tagName === 'P' && text.includes('Español') && text.includes('Tagalog')) {
      languageLinks = el.cloneNode(true);
      return;
    }

    // Logo (picture/img element)
    if ((el.tagName === 'P' && el.querySelector('picture')) || el.tagName === 'PICTURE') {
      logoSection = el.cloneNode(true);
      return;
    }

    // Legal links (508 compliance, FOIA)
    if (el.tagName === 'P' && text.includes('508 compliance')) {
      legalSection = el.cloneNode(true);
      return;
    }

    // Main columns content (h2 and ul elements)
    if (el.tagName === 'H2' || el.tagName === 'UL') {
      mainColumnsContent.push(el.cloneNode(true));
    }
  });

  // Build Last Updated section (TOP of footer)
  if (lastUpdated) {
    const lastUpdatedDiv = document.createElement('div');
    lastUpdatedDiv.classList.add('footer-last-updated');
    lastUpdatedDiv.appendChild(lastUpdated);
    footer.appendChild(lastUpdatedDiv);
  }

  // Build Main Columns section
  if (mainColumnsContent.length > 0) {
    const mainSection = document.createElement('div');
    mainSection.classList.add('footer-main');

    const columnsContainer = document.createElement('div');
    columnsContainer.classList.add('footer-columns');

    // Define column starters
    const columnStarters = [
      'Veteran programs',
      'More VA resources',
      'Get VA updates',
      'In crisis',
    ];

    let currentColumn = null;

    mainColumnsContent.forEach((el) => {
      if (el.tagName === 'H2') {
        const isStarter = columnStarters.some((starter) => el.textContent.includes(starter));
        if (isStarter) {
          currentColumn = document.createElement('div');
          currentColumn.classList.add('footer-column');
          columnsContainer.appendChild(currentColumn);
        }
        if (currentColumn) {
          currentColumn.appendChild(el);
        }
      } else if (currentColumn && el.tagName === 'UL') {
        currentColumn.appendChild(el);
      }
    });

    mainSection.appendChild(columnsContainer);
    footer.appendChild(mainSection);
  }

  // Build Language section
  if (languageLabel || languageLinks) {
    const langDiv = document.createElement('div');
    langDiv.classList.add('footer-language');
    const langContent = document.createElement('div');
    langContent.classList.add('language-content');
    if (languageLabel) {
      languageLabel.classList.add('language-label');
      langContent.appendChild(languageLabel);
    }
    if (languageLinks) {
      languageLinks.classList.add('language-links');
      langContent.appendChild(languageLinks);
    }
    langDiv.appendChild(langContent);
    footer.appendChild(langDiv);
  }

  // Build Logo section
  if (logoSection) {
    const logoDiv = document.createElement('div');
    logoDiv.classList.add('footer-logo');
    logoDiv.appendChild(logoSection);
    footer.appendChild(logoDiv);
  }

  // Build Legal section
  if (legalSection) {
    const legalDiv = document.createElement('div');
    legalDiv.classList.add('footer-legal');
    legalDiv.appendChild(legalSection);
    footer.appendChild(legalDiv);
  }

  // Build PACT Act Banner (BOTTOM of footer)
  if (pactActBanner) {
    const pactDiv = document.createElement('div');
    pactDiv.classList.add('pact-act-banner');
    pactDiv.appendChild(pactActBanner);
    // Add arrow
    const link = pactDiv.querySelector('a');
    if (link) {
      const arrow = document.createElement('span');
      arrow.classList.add('pact-arrow');
      arrow.textContent = '›';
      link.insertAdjacentElement('afterend', arrow);
    }
    footer.appendChild(pactDiv);
  }

  block.append(footer);
}

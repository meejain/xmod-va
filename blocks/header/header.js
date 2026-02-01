import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 960px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.classList.contains('nav-drop');
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
  // Also close all mega menu panels
  sections.querySelectorAll('.mega-menu-panel').forEach((panel) => {
    panel.classList.remove('active');
  });
  sections.querySelectorAll('.mega-menu-category').forEach((cat) => {
    cat.classList.remove('active');
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Build mega menu structure from nested lists
 * @param {Element} navItem The top-level nav item with mega menu content
 */
function buildMegaMenu(navItem) {
  const subMenu = navItem.querySelector(':scope > ul');
  if (!subMenu) return;

  // Create mega menu panel
  const megaPanel = document.createElement('div');
  megaPanel.classList.add('mega-menu-panel');

  // Create categories sidebar
  const categoriesSidebar = document.createElement('div');
  categoriesSidebar.classList.add('mega-menu-sidebar');

  // Create content area
  const contentArea = document.createElement('div');
  contentArea.classList.add('mega-menu-content');

  // Process each category in the submenu
  const categories = subMenu.querySelectorAll(':scope > li');
  categories.forEach((category, index) => {
    // Extract category text - check for <p> tag first, then text node
    let categoryText = '';
    const pTag = category.querySelector(':scope > p');
    if (pTag) {
      categoryText = pTag.textContent.trim();
    } else {
      categoryText = category.childNodes[0]?.textContent?.trim() || '';
    }
    
    const categoryLink = category.querySelector(':scope > a');
    const categorySubMenu = category.querySelector(':scope > ul');

    // Create category button in sidebar
    const categoryBtn = document.createElement('button');
    categoryBtn.classList.add('mega-menu-category');
    categoryBtn.setAttribute('type', 'button');

    if (categoryLink) {
      // If it's a direct link (like "Service members", "Family and caregivers")
      categoryBtn.textContent = categoryLink.textContent;
      categoryBtn.addEventListener('click', () => {
        window.location.href = categoryLink.href;
      });
      categoriesSidebar.appendChild(categoryBtn);
    } else if (categorySubMenu) {
      // Has submenu - create expandable category
      categoryBtn.textContent = categoryText;
      categoryBtn.setAttribute('data-category', index);

      // Create content panel for this category
      const categoryContent = document.createElement('div');
      categoryContent.classList.add('mega-menu-category-content');
      categoryContent.setAttribute('data-category', index);

      // Add "View all" link
      const viewAllLink = document.createElement('a');
      viewAllLink.classList.add('mega-menu-view-all');
      viewAllLink.href = getCategoryUrl(categoryText);
      viewAllLink.innerHTML = `View all in ${categoryText.toLowerCase()} <span class="arrow">›</span>`;
      categoryContent.appendChild(viewAllLink);

      // Process submenu items - group by headings
      const columns = document.createElement('div');
      columns.classList.add('mega-menu-columns');

      // Featured card container
      const featuredCard = document.createElement('div');
      featuredCard.classList.add('mega-menu-featured');

      let currentColumn = null;
      let inFeaturedSection = false;
      let featuredImage = null;
      let featuredTitle = null;

      categorySubMenu.querySelectorAll(':scope > li').forEach((item) => {
        const strongEl = item.querySelector('strong');
        const linkEl = item.querySelector('a');
        const imgEl = item.querySelector('img');

        if (strongEl) {
          if (strongEl.textContent === 'Featured') {
            // Start featured section
            inFeaturedSection = true;
            return;
          }
          // This is a heading - start new column section
          inFeaturedSection = false;
          currentColumn = document.createElement('div');
          currentColumn.classList.add('mega-menu-column');
          const heading = document.createElement('h3');
          heading.textContent = strongEl.textContent;
          currentColumn.appendChild(heading);
          const linkList = document.createElement('ul');
          currentColumn.appendChild(linkList);
          columns.appendChild(currentColumn);
        } else if (inFeaturedSection) {
          // Handle featured content
          if (imgEl) {
            featuredImage = imgEl.cloneNode(true);
            featuredCard.appendChild(featuredImage);
          } else if (linkEl && !featuredTitle) {
            featuredTitle = linkEl.cloneNode(true);
            featuredTitle.classList.add('mega-menu-featured-title');
            featuredCard.appendChild(featuredTitle);
          } else if (!linkEl && item.textContent.trim()) {
            // Description text
            const desc = document.createElement('p');
            desc.classList.add('mega-menu-featured-desc');
            desc.textContent = item.textContent.trim();
            featuredCard.appendChild(desc);
          }
        } else if (linkEl && currentColumn) {
          // This is a link - add to current column
          const li = document.createElement('li');
          li.appendChild(linkEl.cloneNode(true));
          currentColumn.querySelector('ul').appendChild(li);
        }
      });

      // Create a row wrapper for columns and featured card
      const contentRow = document.createElement('div');
      contentRow.classList.add('mega-menu-content-row');
      contentRow.appendChild(columns);
      if (featuredCard.children.length > 0) {
        contentRow.appendChild(featuredCard);
      }
      categoryContent.appendChild(contentRow);
      contentArea.appendChild(categoryContent);

      // Add click handler for category
      categoryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Remove active from all categories
        categoriesSidebar.querySelectorAll('.mega-menu-category').forEach((btn) => {
          btn.classList.remove('active');
        });
        contentArea.querySelectorAll('.mega-menu-category-content').forEach((content) => {
          content.classList.remove('active');
        });
        // Activate this category
        categoryBtn.classList.add('active');
        categoryContent.classList.add('active');
      });

      categoriesSidebar.appendChild(categoryBtn);

      // Set first category as active by default
      if (index === 0) {
        categoryBtn.classList.add('active');
        categoryContent.classList.add('active');
      }
    }
  });

  megaPanel.appendChild(categoriesSidebar);
  megaPanel.appendChild(contentArea);

  // Replace the original submenu with mega panel
  subMenu.style.display = 'none';
  navItem.appendChild(megaPanel);
}

/**
 * Build simple mega menu for About VA (no nested categories)
 * @param {Element} navItem The nav item with simple multi-column content
 */
function buildSimpleMegaMenu(navItem) {
  const subMenu = navItem.querySelector(':scope > ul');
  if (!subMenu) return;

  // Create mega menu panel
  const megaPanel = document.createElement('div');
  megaPanel.classList.add('mega-menu-panel', 'mega-menu-simple');

  // Create columns container
  const columns = document.createElement('div');
  columns.classList.add('mega-menu-columns');

  let currentColumn = null;
  subMenu.querySelectorAll(':scope > li').forEach((item) => {
    const strongEl = item.querySelector('strong');
    const linkEl = item.querySelector('a');

    if (strongEl) {
      // This is a heading - start new column
      currentColumn = document.createElement('div');
      currentColumn.classList.add('mega-menu-column');
      const heading = document.createElement('h3');
      heading.textContent = strongEl.textContent;
      currentColumn.appendChild(heading);
      const linkList = document.createElement('ul');
      currentColumn.appendChild(linkList);
      columns.appendChild(currentColumn);
    } else if (linkEl && currentColumn) {
      // This is a link - add to current column
      const li = document.createElement('li');
      li.appendChild(linkEl.cloneNode(true));
      currentColumn.querySelector('ul').appendChild(li);
    }
  });

  megaPanel.appendChild(columns);

  // Replace the original submenu with mega panel
  subMenu.style.display = 'none';
  navItem.appendChild(megaPanel);
}

/**
 * Get URL for category view all link
 * @param {String} categoryName The category name
 * @returns {String} The URL
 */
function getCategoryUrl(categoryName) {
  const urlMap = {
    'Health care': 'https://www.va.gov/health-care',
    'Disability': 'https://www.va.gov/disability',
    'Education and training': 'https://www.va.gov/education',
    'Careers and employment': 'https://www.va.gov/careers-employment',
    'Pension': 'https://www.va.gov/pension',
    'Housing assistance': 'https://www.va.gov/housing-assistance',
    'Life insurance': 'https://www.va.gov/life-insurance',
    'Burials and memorials': 'https://www.va.gov/burials-memorials',
    'Records': 'https://www.va.gov/records',
  };
  return urlMap[categoryName] || '#';
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Handle 2-section structure: brand (banner+crisis+logo+tools), sections (main nav)
  // Filter out HR elements (section separators)
  const sections = [...nav.children].filter((child) => child.tagName !== 'HR');
  const classes = ['brand', 'sections'];
  classes.forEach((c, i) => {
    const section = sections[i];
    if (section) {
      section.classList.add(`nav-${c}`);
      // Remove section class and display:none that was added by decorateSections
      section.classList.remove('section');
      section.removeAttribute('data-section-status');
      section.style.display = '';
    }
  });

  // Hide HR separators
  nav.querySelectorAll(':scope > hr').forEach((hr) => {
    hr.style.display = 'none';
  });

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      const buttonContainer = brandLink.closest('.button-container');
      if (buttonContainer) buttonContainer.className = '';
    }

    // Set data-text attribute for Veterans Crisis Line button (desktop styling)
    const crisisLine = navBrand.querySelector('.default-content-wrapper > p:nth-child(2)');
    if (crisisLine) {
      // Remove the arrow link element if present
      const arrowLink = crisisLine.querySelector('a');
      if (arrowLink && arrowLink.textContent.trim() === '>') {
        arrowLink.remove();
      }
      // Get clean text without the arrow
      const textContent = crisisLine.textContent.trim().replace(/>\s*$/, '').trim();
      crisisLine.setAttribute('data-text', textContent);
    }

    // Wrap logo and tools in a container div for better flex layout
    const contentWrapper = navBrand.querySelector('.default-content-wrapper');
    if (contentWrapper) {
      const logo = contentWrapper.querySelector('p:nth-child(3)');
      const tools = contentWrapper.querySelector('ul');

      if (logo && tools) {
        // Create wrapper div
        const logoToolsWrapper = document.createElement('div');
        logoToolsWrapper.classList.add('logo-tools-wrapper');

        // Insert wrapper before logo
        contentWrapper.insertBefore(logoToolsWrapper, logo);

        // Move logo and tools into wrapper
        logoToolsWrapper.appendChild(logo);
        logoToolsWrapper.appendChild(tools);

        // Replace Search link with a dropdown button
        const searchLi = tools.querySelector('li:first-child');
        const searchLink = searchLi?.querySelector('a');
        if (searchLink && searchLink.textContent.trim().toLowerCase() === 'search') {
          // Create search dropdown container
          const searchDropdown = document.createElement('div');
          searchDropdown.classList.add('search-dropdown');

          // Create search button
          const searchBtn = document.createElement('button');
          searchBtn.classList.add('search-dropdown-btn');
          searchBtn.setAttribute('type', 'button');
          searchBtn.setAttribute('aria-expanded', 'false');
          searchBtn.innerHTML = `<span class="search-icon"></span><span class="search-text">Search</span><span class="search-arrow"></span>`;

          // Create dropdown panel
          const searchPanel = document.createElement('div');
          searchPanel.classList.add('search-dropdown-panel');
          searchPanel.innerHTML = `
            <div class="search-input-wrapper">
              <input type="text" class="search-input" placeholder="" aria-label="Search" aria-autocomplete="none" autocomplete="off">
              <button type="submit" class="search-submit-btn" aria-label="Search">
                <svg aria-hidden="true" focusable="false" width="18" viewBox="3 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd" d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"></path>
                </svg>
                <span class="usa-sr-only">Search</span>
              </button>
            </div>
          `;

          // Add click handler for search button
          searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = searchBtn.getAttribute('aria-expanded') === 'true';
            searchBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            searchPanel.classList.toggle('active', !expanded);
            
            // Focus input when opening
            if (!expanded) {
              setTimeout(() => {
                searchPanel.querySelector('.search-input').focus();
              }, 100);
            }
          });

          // Handle search submission
          const searchInput = searchPanel.querySelector('.search-input');
          const searchSubmit = searchPanel.querySelector('.search-submit-btn');

          const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
              window.location.href = `https://www.va.gov/search/?query=${encodeURIComponent(query)}`;
            }
          };

          searchSubmit.addEventListener('click', performSearch);
          searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              performSearch();
            }
          });
          
          // Close dropdown on Escape key
          searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              searchBtn.setAttribute('aria-expanded', 'false');
              searchPanel.classList.remove('active');
              searchBtn.focus();
            }
          });

          // Close dropdown when clicking outside
          document.addEventListener('click', (e) => {
            if (!searchDropdown.contains(e.target)) {
              searchBtn.setAttribute('aria-expanded', 'false');
              searchPanel.classList.remove('active');
            }
          });

          searchDropdown.appendChild(searchBtn);
          searchDropdown.appendChild(searchPanel);

          // Replace the link with the dropdown
          searchLi.innerHTML = '';
          searchLi.appendChild(searchDropdown);
        }
      }
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const mainNavItems = navSections.querySelectorAll(':scope .default-content-wrapper > ul > li');
    mainNavItems.forEach((navItem, index) => {
      const hasSubMenu = navItem.querySelector(':scope > ul');
      if (hasSubMenu) {
        navItem.classList.add('nav-drop');

        // Check if it's a complex mega menu (VA Benefits) or simple (About VA)
        const hasNestedCategories = hasSubMenu.querySelector(':scope > li > ul');
        if (hasNestedCategories) {
          buildMegaMenu(navItem);
        } else {
          buildSimpleMegaMenu(navItem);
        }

        // Create button for the nav item
        // Find the text - it might be in a <p> tag or text node
        let navText = '';
        let textElement = null;
        
        // Check for <p> tag first
        const pTag = navItem.querySelector(':scope > p');
        if (pTag) {
          navText = pTag.textContent.trim();
          textElement = pTag;
        } else {
          // Fallback to text node
          navText = navItem.childNodes[0]?.textContent?.trim() || '';
        }

        const navButton = document.createElement('button');
        navButton.classList.add('nav-drop-button');
        navButton.setAttribute('type', 'button');
        navButton.setAttribute('aria-expanded', 'false');
        navButton.innerHTML = `${navText} <span class="nav-drop-arrow"></span>`;

        // Insert button at the beginning
        navItem.insertBefore(navButton, navItem.firstChild);
        
        // Remove the original text element (either <p> tag or text node)
        if (textElement) {
          textElement.remove();
        } else if (navItem.childNodes[1]?.nodeType === Node.TEXT_NODE) {
          navItem.childNodes[1].remove();
        }

        // Add click handler
        navButton.addEventListener('click', (e) => {
          e.stopPropagation();
          const expanded = navItem.getAttribute('aria-expanded') === 'true';

          // Close all other nav items
          mainNavItems.forEach((item) => {
            if (item !== navItem) {
              item.setAttribute('aria-expanded', 'false');
              const panel = item.querySelector('.mega-menu-panel');
              if (panel) panel.classList.remove('active');
            }
          });

          // Toggle this item
          navItem.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          const megaPanel = navItem.querySelector('.mega-menu-panel');
          if (megaPanel) {
            megaPanel.classList.toggle('active', !expanded);
            
            // Position mega menu to align with first nav item
            if (!expanded) {
              const firstNavItem = mainNavItems[0];
              const navItemRect = navItem.getBoundingClientRect();
              const firstNavItemRect = firstNavItem.getBoundingClientRect();
              const offset = firstNavItemRect.left - navItemRect.left;
              megaPanel.style.left = `${offset - 4}px`;
            }
          }
        });
      }
    });

    // Close mega menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navSections.contains(e.target)) {
        toggleAllNavSections(navSections);
      }
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  
  // Add crisis line modal handler
  const crisisLineBtn = nav.querySelector('.nav-brand > .default-content-wrapper > p:nth-child(2)');
  if (crisisLineBtn) {
    crisisLineBtn.addEventListener('click', () => {
      openCrisisLineModal();
    });
  }
  
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}

/**
 * Create and open the Veterans Crisis Line modal
 */
function openCrisisLineModal() {
  // Create modal if it doesn't exist
  let modal = document.getElementById('vcl-modal-crisisline');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'vcl-modal-crisisline';
    modal.className = 'vcl-overlay va-modal va-modal-large';
    modal.setAttribute('role', 'alertdialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'vcl-modal-title');
    
    modal.innerHTML = `
      <div class="vcl-crisis-panel va-modal-inner">
        <button aria-label="Close this modal" id="vcl-modal-close" type="button" class="vcl-modal-close">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
        </button>
        <div class="vcl-overlay-body vcl-crisis-panel-body">
          <h3 id="vcl-modal-title" class="vcl-crisis-panel-title">We're here anytime, day or night – 24/7</h3>
          <p>If you are a Veteran in crisis or concerned about one, connect with our caring, qualified responders for confidential help. Many of them are Veterans themselves.</p>
          <ul class="vcl-crisis-panel-list">
            <li>
              <svg aria-hidden="true" class="vcl-crisis-panel-icon" focusable="false" viewBox="0 0 23 23" width="30" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(270deg);">
                <path fill="#000" fill-rule="evenodd" clip-rule="evenodd" d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"></path>
              </svg>
              <a href="tel:988">Call <strong>988 and select 1</strong></a>
            </li>
            <li>
              <svg aria-hidden="true" class="vcl-crisis-panel-icon" focusable="false" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                <path fill="#000" d="M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1Zm-4 21a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm4.5-4H7V4h9v14Z"></path>
              </svg>
              <a href="sms:838255">Text <strong>838255</strong></a>
            </li>
            <li>
              <svg aria-hidden="true" class="vcl-crisis-panel-icon" focusable="false" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                <path fill="#000" fill-rule="evenodd" clip-rule="evenodd" d="M21 6H19V15H6V17C6 17.55 6.45 18 7 18H18L22 22V7C22 6.45 21.55 6 21 6ZM17 12V3C17 2.45 16.55 2 16 2H3C2.45 2 2 2.45 2 3V17L6 13H16C16.55 13 17 12.55 17 12Z"></path>
              </svg>
              <a class="no-external-icon" href="https://www.veteranscrisisline.net/get-help-now/chat/">Start a confidential chat</a>
            </li>
            <li>
              <svg aria-hidden="true" class="vcl-crisis-panel-icon" focusable="false" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                <path fill="#1B1B1B" fill-rule="evenodd" d="m20.51 22-6.79-6.79c-.34.28-.62.52-.86.75-.24.22-.44.45-.6.7a6.72 6.72 0 0 0-.48.8 11.8 11.8 0 0 0-.44 1.03c-.31.81-.8 1.45-1.45 1.9a3.84 3.84 0 0 1-2.25.7 3.3 3.3 0 0 1-2.36-.95 3.52 3.52 0 0 1-1.1-2.34h1.38a2.19 2.19 0 0 0 .7 1.37 2 2 0 0 0 1.38.54c.55 0 1.04-.18 1.46-.52a3.9 3.9 0 0 0 1.07-1.55 11.2 11.2 0 0 1 1.1-2c.21-.27.44-.53.67-.76a8.24 8.24 0 0 1 .77-.68L5.83 7.32a6.64 6.64 0 0 0-.2.72 5.16 5.16 0 0 0-.1.77H4.16a8.29 8.29 0 0 1 .2-1.33c.1-.43.23-.83.41-1.21L2 3.49l.99-.99 18.5 18.51-.98.99Zm-2.32-6.26-.98-.99a8.6 8.6 0 0 0 1.56-2.7A9.05 9.05 0 0 0 19.29 9c0-1.17-.2-2.28-.6-3.33a7.82 7.82 0 0 0-1.78-2.74L17.94 2a9.5 9.5 0 0 1 2.02 3.17 10.4 10.4 0 0 1 .08 7.4 10.5 10.5 0 0 1-1.85 3.17Zm-2.52-2.52-1.05-1.06a5.57 5.57 0 0 0 .78-3.07c0-1.38-.47-2.54-1.4-3.48a4.68 4.68 0 0 0-3.47-1.4c-.56 0-1.1.07-1.6.22a5.16 5.16 0 0 0-1.38.67l-.99-.99a6.34 6.34 0 0 1 1.84-.95 6.77 6.77 0 0 1 2.13-.33c1.84 0 3.34.58 4.5 1.75a6.12 6.12 0 0 1 1.74 4.5 9.3 9.3 0 0 1-.26 2.29 6.03 6.03 0 0 1-.84 1.85ZM12.46 10 9.59 7.14a2.24 2.24 0 0 1 .46-.17 2.02 2.02 0 0 1 2 .58 2.2 2.2 0 0 1 .41 2.45Zm-1.97 1.21c-.6 0-1.1-.2-1.52-.62a2.06 2.06 0 0 1-.62-1.51 2.27 2.27 0 0 1 .23-.99l2.9 2.9a2.27 2.27 0 0 1-1 .22Z" clip-rule="evenodd"></path>
              </svg>
              <p><a href="tel:711">For TTY, call <strong>711 then 988</strong></a></p>
            </li>
          </ul>
          <p class="vcl-modal-footer">Get more resources at <a href="https://www.veteranscrisisline.net/">VeteransCrisisLine.net</a>.</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add close button handler
    const closeBtn = modal.querySelector('#vcl-modal-close');
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('vcl-overlay--open');
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('vcl-overlay--open');
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('vcl-overlay--open')) {
        modal.classList.remove('vcl-overlay--open');
      }
    });
  }
  
  // Open modal
  modal.classList.add('vcl-overlay--open');
  
  // Focus the close button for accessibility
  setTimeout(() => {
    modal.querySelector('#vcl-modal-close').focus();
  }, 100);
}


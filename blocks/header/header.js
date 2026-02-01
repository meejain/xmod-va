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
              <input type="text" class="search-input" placeholder="Search VA.gov" aria-label="Search VA.gov">
              <button type="submit" class="search-submit-btn" aria-label="Search">
                <span class="search-icon"></span>
              </button>
            </div>
          `;

          // Add click handler for search button
          searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = searchBtn.getAttribute('aria-expanded') === 'true';
            searchBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            searchPanel.classList.toggle('active', !expanded);
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
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}

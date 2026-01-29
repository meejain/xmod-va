/**
 * VA.gov Site-Wide Cleanup Transformer
 * Removes site-specific elements that shouldn't be imported
 */

export function preTransform(document) {
  // Remove government banner
  const banner = document.querySelector('.va-notice--banner');
  if (banner) banner.remove();

  // Remove crisis line banner
  const crisisLine = document.querySelector('.vcl-crisis-line-container');
  if (crisisLine) crisisLine.remove();

  // Remove header navigation
  const header = document.querySelector('header');
  if (header) header.remove();

  // Remove mega menu
  const megaMenu = document.querySelector('#mega-menu');
  if (megaMenu) megaMenu.remove();

  // Remove skip links
  const skipLinks = document.querySelector('#skiplink');
  if (skipLinks) skipLinks.remove();

  // Remove footer
  const footer = document.querySelector('footer');
  if (footer) footer.remove();

  // Remove sidebars that shouldn't be imported
  const leftNav = document.querySelector('.left-sidebar-nav');
  if (leftNav) leftNav.remove();

  // Remove social media widgets (handled separately)
  const socialWidgets = document.querySelectorAll('.social-widget, .connect-widget');
  socialWidgets.forEach(w => w.remove());

  // Remove form elements (email signup)
  const forms = document.querySelectorAll('form[action*="govdelivery"]');
  forms.forEach(f => f.remove());

  // Remove script and style tags
  const scripts = document.querySelectorAll('script, style, noscript');
  scripts.forEach(s => s.remove());

  // Remove tracking pixels and analytics
  const tracking = document.querySelectorAll('[src*="siteimprove"], [src*="analytics"]');
  tracking.forEach(t => t.remove());

  // Clean up empty divs
  const emptyDivs = document.querySelectorAll('div:empty');
  emptyDivs.forEach(d => d.remove());
}

export function postTransform(document) {
  // Clean up any remaining VA-specific classes
  const elements = document.querySelectorAll('[class*="vads-"], [class*="usa-"]');
  elements.forEach(el => {
    // Keep the element but clean VA-specific classes
    const classes = Array.from(el.classList);
    classes.forEach(cls => {
      if (cls.startsWith('vads-') || cls.startsWith('usa-')) {
        el.classList.remove(cls);
      }
    });
  });

  // Fix relative URLs to absolute
  const links = document.querySelectorAll('a[href^="/"]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      link.setAttribute('href', 'https://www.va.gov' + href);
    }
  });

  // Fix relative image URLs
  const images = document.querySelectorAll('img[src^="/"]');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('/') && !src.startsWith('//')) {
      img.setAttribute('src', 'https://www.va.gov' + src);
    }
  });
}

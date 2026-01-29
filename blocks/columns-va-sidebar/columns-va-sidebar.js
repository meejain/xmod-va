/*
 * Columns Block - VA Sidebar Variant
 * Two-column layout for sidebar with social links and resources
 */

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-va-sidebar-${cols.length}-cols`);

  // Process each row
  [...block.children].forEach((row) => {
    [...row.children].forEach((col, index) => {
      // Add column class based on position
      col.classList.add(index === 0 ? 'va-sidebar-connect' : 'va-sidebar-resources');

      // Style social media icon links
      const links = col.querySelectorAll('a');
      links.forEach((link) => {
        const img = link.querySelector('img');
        if (img && link.children.length === 1) {
          link.classList.add('va-sidebar-social-link');
        }
      });

      // Style resource lists
      const lists = col.querySelectorAll('ul');
      lists.forEach((list) => {
        list.classList.add('va-sidebar-list');
      });
    });
  });
}

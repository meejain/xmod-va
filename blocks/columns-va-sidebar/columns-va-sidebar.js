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

      // Wrap headings in widget-title div
      const headings = col.querySelectorAll('h3, h4');
      headings.forEach((heading) => {
        if (!heading.parentElement.classList.contains('widget-title')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'widget-title';
          heading.parentNode.insertBefore(wrapper, heading);
          wrapper.appendChild(heading);
        }
      });

      // For Connect with VHA section - create two-column social media layout
      if (col.classList.contains('va-sidebar-connect')) {
        // Find all paragraphs with social media links (containing images)
        const socialParas = [...col.querySelectorAll('p')].filter((p) => {
          const link = p.querySelector('a');
          const img = link?.querySelector('img');
          return img && link.children.length === 1;
        });

        if (socialParas.length > 0) {
          // Create widget-social wrapper
          const widgetSocial = document.createElement('div');
          widgetSocial.id = 'widget-social';

          // Create left column (first 3 social links)
          const leftCol = document.createElement('div');
          leftCol.className = 'widget-social-col-l';

          // Create right column (last 3 social links)
          const rightCol = document.createElement('div');
          rightCol.className = 'widget-social-col-r';

          // Split social links into two columns
          socialParas.forEach((para, idx) => {
            const clonedPara = para.cloneNode(true);
            if (idx < 3) {
              leftCol.appendChild(clonedPara);
            } else {
              rightCol.appendChild(clonedPara);
            }
            para.remove();
          });

          // Append columns to widget-social
          widgetSocial.appendChild(leftCol);
          widgetSocial.appendChild(rightCol);

          // Insert widget-social after the heading
          const widgetTitle = col.querySelector('.widget-title');
          if (widgetTitle) {
            widgetTitle.insertAdjacentElement('afterend', widgetSocial);
          } else {
            col.insertBefore(widgetSocial, col.firstChild);
          }
        }

        // Wrap remaining content (subscribe section) in widget-email
        const remainingParas = [...col.querySelectorAll('p')].filter((p) => !p.closest('#widget-social'));
        const remainingContent = [...col.querySelectorAll('ul, form, input, button')];
        
        if (remainingParas.length > 0 || remainingContent.length > 0) {
          const widgetEmail = document.createElement('div');
          widgetEmail.id = 'widget-email';
          
          // Move subscribe paragraphs into widget-email
          remainingParas.forEach((p) => {
            widgetEmail.appendChild(p.cloneNode(true));
            p.remove();
          });
          
          // Move forms and other elements
          remainingContent.forEach((elem) => {
            if (!elem.closest('#widget-email')) {
              widgetEmail.appendChild(elem.cloneNode(true));
              elem.remove();
            }
          });
          
          // Insert after widget-social
          const widgetSocialElem = col.querySelector('#widget-social');
          if (widgetSocialElem) {
            widgetSocialElem.insertAdjacentElement('afterend', widgetEmail);
          }
        }
      }

      // Style resource lists
      const lists = col.querySelectorAll('ul');
      lists.forEach((list) => {
        list.classList.add('va-sidebar-list');
      });
    });
  });
}

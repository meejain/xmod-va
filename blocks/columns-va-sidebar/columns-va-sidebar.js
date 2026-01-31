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
          
          // Move subscribe paragraphs into widget-email, replacing Form-Placeholder
          remainingParas.forEach((p) => {
            // Check if this paragraph contains the Form-Placeholder
            if (p.textContent.includes('Form-Placeholder')) {
              // Create the email subscription form
              const form = document.createElement('form');
              form.action = 'https://public.govdelivery.com/accounts/USVHA/subscribers/qualify';
              
              // Hidden category_id input
              const categoryInput = document.createElement('input');
              categoryInput.id = 'category_id';
              categoryInput.name = 'category_id';
              categoryInput.type = 'hidden';
              categoryInput.value = 'USVHA_C4';
              form.appendChild(categoryInput);
              
              // Hidden label for required image
              const requiredLabel = document.createElement('label');
              requiredLabel.htmlFor = 'email';
              requiredLabel.style.position = 'absolute';
              requiredLabel.style.left = '-9999px';
              const requiredImg = document.createElement('img');
              requiredImg.alt = 'Required';
              requiredImg.className = 'required';
              requiredImg.src = 'https://public.govdelivery.com/images/required.gif?1215719772';
              requiredLabel.appendChild(requiredImg);
              requiredLabel.append('Button to subscribe to email');
              form.appendChild(requiredLabel);
              
              // Hidden label for email
              const emailLabel = document.createElement('label');
              emailLabel.htmlFor = 'email';
              emailLabel.style.position = 'absolute';
              emailLabel.style.left = '-9999px';
              emailLabel.textContent = 'Email Address';
              form.appendChild(emailLabel);
              
              // Email input field
              const emailInput = document.createElement('input');
              emailInput.id = 'email';
              emailInput.className = 'inputstyle';
              emailInput.type = 'text';
              emailInput.title = 'enter email here';
              emailInput.value = 'Email Address';
              emailInput.size = 10;
              emailInput.name = 'email';
              emailInput.onfocus = function() {
                this.value = '';
              };
              form.appendChild(emailInput);
              
              // Submit button wrapper
              const buttonDiv = document.createElement('div');
              buttonDiv.id = 'widget-email-Button';
              
              // Hidden label for button
              const buttonLabel = document.createElement('label');
              buttonLabel.htmlFor = 'form_button';
              buttonLabel.style.position = 'absolute';
              buttonLabel.style.left = '-9999px';
              buttonLabel.textContent = 'Button to subscribe to email';
              buttonDiv.appendChild(buttonLabel);
              
              // Image submit button
              const submitButton = document.createElement('input');
              submitButton.className = 'form_button';
              submitButton.name = 'commit';
              submitButton.type = 'image';
              submitButton.src = 'https://main--xmod-va--meejain.aem.page/assets/media_1cf1bc1949b48c8d57f1c0e5dce7e9ff2eeff8af2.png';
              submitButton.alt = 'subscribe';
              submitButton.value = 'Submit';
              submitButton.title = 'Click here to submit your email';
              buttonDiv.appendChild(submitButton);
              
              form.appendChild(buttonDiv);
              
              // Add form to widgetEmail instead of the placeholder paragraph
              widgetEmail.appendChild(form);
              p.remove();
            } else {
              widgetEmail.appendChild(p.cloneNode(true));
              p.remove();
            }
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

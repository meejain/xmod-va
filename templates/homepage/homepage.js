export default async function decorate(doc) {
  const main = doc.querySelector('main');
  if (!main) {
    // eslint-disable-next-line no-console
    console.warn('Homepage template: main element not found');
    return;
  }

  // Find the dropdown and accordion block wrappers (not just the blocks)
  const dropdownWrapper = main.querySelector('.dropdown-va-persona-wrapper');
  const accordionWrapper = main.querySelector('.accordion-va-menu-wrapper');

  if (!dropdownWrapper || !accordionWrapper) {
    // eslint-disable-next-line no-console
    console.warn('Homepage template: dropdown or accordion wrapper not found', {
      dropdown: !!dropdownWrapper,
      accordion: !!accordionWrapper,
    });
    return;
  }

  // Verify blocks are loaded
  const dropdown = dropdownWrapper.querySelector('.dropdown-va-persona');
  const accordion = accordionWrapper.querySelector('.accordion-va-menu');
  
  if (!dropdown || !accordion) {
    // eslint-disable-next-line no-console
    console.warn('Homepage template: blocks not found in wrappers');
    return;
  }

  // Check if blocks are loaded
  if (dropdown.dataset.blockStatus !== 'loaded' || accordion.dataset.blockStatus !== 'loaded') {
    // eslint-disable-next-line no-console
    console.warn('Homepage template: blocks not fully loaded', {
      dropdownStatus: dropdown.dataset.blockStatus,
      accordionStatus: accordion.dataset.blockStatus,
    });
  }

  // Create the outer wrapper structure
  const bgMain = document.createElement('div');
  bgMain.id = 'bg-main';

  const bgMiddleEffect = document.createElement('div');
  bgMiddleEffect.id = 'bg-middle-effect';

  const container = document.createElement('div');
  container.className = 'container';
  container.id = 'main-wrap';

  const row = document.createElement('section');
  row.className = 'row';
  row.id = 'container';

  // Create left column (col-md-3)
  const leftCol = document.createElement('div');
  leftCol.className = 'col-md-3';

  const leftFill = document.createElement('div');
  leftFill.className = 'fill';

  const leftNavContainer = document.createElement('div');
  leftNavContainer.id = 'leftNavContainer';
  leftNavContainer.className = 'clearfix';

  // Move dropdown and accordion wrappers into left nav
  leftNavContainer.appendChild(dropdownWrapper);
  leftNavContainer.appendChild(accordionWrapper);

  // Find and move left column content (Quick Links, widgets, badges, etc.)
  let leftColContent = document.createElement('div');
  leftColContent.id = 'left-col-content';

  // Look for the section that contains dropdown and accordion
  // It may also contain Quick Links content
  const leftNavSection = main.querySelector('.dropdown-va-persona-container.accordion-va-menu-container');
  
  if (leftNavSection) {
    // Find any default-content-wrapper in this section (contains Quick Links)
    const contentWrappers = leftNavSection.querySelectorAll('.default-content-wrapper');
    
    contentWrappers.forEach(wrapper => {
      // Check if this wrapper contains Quick Links content
      const strongTag = wrapper.querySelector('strong');
      if (strongTag && strongTag.textContent.includes('Quick Links')) {
        // Found Quick Links content, split into 3 containers
        wrapper.remove();
        
        // Get all paragraphs
        const allParagraphs = Array.from(wrapper.querySelectorAll('p'));
        
        if (allParagraphs.length >= 3) {
          // First container: title + first 4 images (indices 0-4)
          const firstContainer = document.createElement('div');
          firstContainer.className = 'default-content-wrapper quick-links-main';
          firstContainer.id = 'widget-quick-links';
          
          // Add title (index 0)
          firstContainer.appendChild(allParagraphs[0].cloneNode(true));
          
          // Wrap Hospital Locator image (index 1) in a container with form
          if (allParagraphs.length > 1) {
            const locatorWrapper = document.createElement('div');
            locatorWrapper.id = 'widget-locator';
            
            // Add the Hospital Locator image
            locatorWrapper.appendChild(allParagraphs[1].cloneNode(true));
            
            // Create the ZIP code form
            const locatorForm = document.createElement('form');
            locatorForm.id = 'locator-form';
            locatorForm.setAttribute('onsubmit', 'return Validate();');
            locatorForm.setAttribute('name', 'zipSearch');
            locatorForm.setAttribute('method', 'get');
            locatorForm.setAttribute('action', 'https://www.va.gov/find-locations/');
            
            // Create ZIP code input
            const zipLabel = document.createElement('label');
            zipLabel.setAttribute('for', 'LocatorPostalCode');
            zipLabel.style.position = 'absolute';
            zipLabel.style.left = '-9999px';
            zipLabel.textContent = 'Enter ZIP code here';
            
            const zipInput = document.createElement('input');
            zipInput.id = 'LocatorPostalCode';
            zipInput.className = 'inputstyle';
            zipInput.type = 'text';
            zipInput.setAttribute('onfocus', "this.value=''");
            zipInput.size = 10;
            zipInput.maxLength = 10;
            zipInput.value = 'Zip Code';
            zipInput.name = 'inputaddress';
            zipInput.title = 'Enter ZIP here';
            
            // Create Go button
            const zipButton = document.createElement('div');
            zipButton.id = 'zipButton';
            
            const buttonLabel = document.createElement('label');
            buttonLabel.setAttribute('for', 'zipInputButton');
            buttonLabel.style.position = 'absolute';
            buttonLabel.style.left = '-9999px';
            buttonLabel.textContent = 'Enter ZIP code here';
            
            const buttonInput = document.createElement('input');
            buttonInput.id = 'zipInputButton';
            buttonInput.type = 'image';
            buttonInput.src = 'https://main--xmod-va--meejain.aem.page/assets/media_14e944e0f6bfab121da42c9dcf934be6766cdc5fe.png';
            buttonInput.alt = 'Search';
            buttonInput.title = 'Click here to submit';
            
            zipButton.appendChild(buttonLabel);
            zipButton.appendChild(buttonInput);
            
            locatorForm.appendChild(zipLabel);
            locatorForm.appendChild(zipInput);
            locatorForm.appendChild(zipButton);
            
            locatorWrapper.appendChild(locatorForm);
            firstContainer.appendChild(locatorWrapper);
          }
          
          // Add remaining images (indices 2-4)
          for (let i = 2; i < Math.min(5, allParagraphs.length); i++) {
            firstContainer.appendChild(allParagraphs[i].cloneNode(true));
          }
          
          leftColContent.appendChild(firstContainer);
          
          // Second container: 5th image (Veterans Crisis Line) if exists
          if (allParagraphs.length > 5) {
            const secondContainer = document.createElement('div');
            secondContainer.className = 'default-content-wrapper quick-links-badge';
            secondContainer.appendChild(allParagraphs[5].cloneNode(true));
            leftColContent.appendChild(secondContainer);
          }
          
          // Third container: 6th image (My HealtheVet) if exists
          if (allParagraphs.length > 6) {
            const thirdContainer = document.createElement('div');
            thirdContainer.className = 'default-content-wrapper quick-links-badge';
            thirdContainer.appendChild(allParagraphs[6].cloneNode(true));
            leftColContent.appendChild(thirdContainer);
          }
          
          // eslint-disable-next-line no-console
          console.log('Split Quick Links into 3 containers with ZIP form');
        } else {
          // Fallback: just add the wrapper as-is
          leftColContent.appendChild(wrapper);
        }
      }
    });
  }

  // Also check for standalone #left-col-content or .widget elements
  let existingLeftContent = main.querySelector('#left-col-content');
  if (existingLeftContent) {
    existingLeftContent.remove();
    // Move all children to our leftColContent
    while (existingLeftContent.firstChild) {
      leftColContent.appendChild(existingLeftContent.firstChild);
    }
    // eslint-disable-next-line no-console
    console.log('Found #left-col-content, moving to left sidebar');
  }

  // Look for .widget elements anywhere in main
  const widgets = main.querySelectorAll('.widget');
  if (widgets.length > 0) {
    widgets.forEach(widget => {
      widget.remove();
      leftColContent.appendChild(widget);
    });
    // eslint-disable-next-line no-console
    console.log(`Found ${widgets.length} widget(s), moving to left sidebar`);
  }
  
  // Append to structure
  leftFill.appendChild(leftNavContainer);
  leftFill.appendChild(leftColContent);
  leftCol.appendChild(leftFill);

  // Create right column (col-md-9)
  const rightCol = document.createElement('div');
  rightCol.className = 'col-md-9';

  const rightFill = document.createElement('div');
  rightFill.className = 'fill';

  // Move main content into right column
  rightFill.appendChild(main);
  
  // Find all sections with class "middle" and group them in tabs-va-content-wrapper
  const middleSections = main.querySelectorAll('.section.middle');
  const tabsWrapper = main.querySelector('.tabs-va-content-wrapper');
  
  if (tabsWrapper && middleSections.length > 0) {
    // Create a container div for all middle sections
    const middleContentContainer = document.createElement('div');
    middleContentContainer.className = 'middle-content-container';
    
    // Move all middle sections into the container
    middleSections.forEach(section => {
      section.remove();
      middleContentContainer.appendChild(section);
    });
    
    // Append the container to tabs-va-content-wrapper
    tabsWrapper.appendChild(middleContentContainer);
    
    // eslint-disable-next-line no-console
    console.log(`Moved ${middleSections.length} middle section(s) into tabs-va-content-wrapper`);
  }
  
  rightCol.appendChild(rightFill);

  // Assemble the structure
  row.appendChild(leftCol);
  row.appendChild(rightCol);
  container.appendChild(row);
  bgMiddleEffect.appendChild(container);
  bgMain.appendChild(bgMiddleEffect);

  // Insert the new structure into the body
  doc.body.insertBefore(bgMain, doc.body.firstChild);

  // Add homepage-template class to body
  doc.body.classList.add('homepage-template');

  // eslint-disable-next-line no-console
  console.log('Homepage template applied successfully');
}

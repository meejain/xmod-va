/**
 * Dropdown VA Persona - "I AM A..." quick navigation dropdown
 * Allows users to quickly navigate to persona-specific pages
 * Matches VA.gov left sidebar styling
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Build dropdown options from block content
  const options = rows.map((row) => {
    const cells = [...row.children];
    const label = cells[0]?.textContent?.trim() || '';
    const url = cells[1]?.querySelector('a')?.href || cells[1]?.textContent?.trim() || '#';
    return { label, url };
  });

  // Create the label
  const label = document.createElement('label');
  label.htmlFor = 'iama';
  label.textContent = 'I AM A...';

  // Create the styled select wrapper
  const selectWrapper = document.createElement('div');
  selectWrapper.className = 'dropdown-va-persona-select-wrapper styled-select';

  // Create the select element
  const select = document.createElement('select');
  select.id = 'iama';
  select.name = 'mydropdown';
  select.className = 'dropdown-va-persona-select dropdown';

  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '0';
  defaultOption.textContent = 'Select One';
  select.appendChild(defaultOption);

  // Add options from content
  options.forEach(({ label: optLabel, url }) => {
    if (optLabel && url) {
      const option = document.createElement('option');
      option.value = url;
      option.textContent = optLabel;
      select.appendChild(option);
    }
  });

  // Handle selection change
  select.addEventListener('change', (e) => {
    const selectedUrl = e.target.value;
    if (selectedUrl && selectedUrl !== '0') {
      window.location.href = selectedUrl;
    }
  });

  // Assemble the structure
  selectWrapper.appendChild(select);

  // Clear block and add new content
  block.textContent = '';
  block.appendChild(label);
  block.appendChild(selectWrapper);
}

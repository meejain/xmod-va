/**
 * Dropdown VA Persona - "I am a" quick navigation dropdown
 * Allows users to quickly navigate to persona-specific pages
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

  // Create the dropdown structure
  const wrapper = document.createElement('div');
  wrapper.className = 'dropdown-va-persona-wrapper-inner';

  const label = document.createElement('label');
  label.htmlFor = 'iama-dropdown';
  label.textContent = 'I am a:';

  const select = document.createElement('select');
  select.id = 'iama-dropdown';
  select.className = 'dropdown-va-persona-select';

  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
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
    if (selectedUrl) {
      window.location.href = selectedUrl;
    }
  });

  wrapper.appendChild(label);
  wrapper.appendChild(select);

  // Clear block and add new content
  block.textContent = '';
  block.appendChild(wrapper);
}

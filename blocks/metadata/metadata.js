/**
 * Metadata block - hides itself as it's only used for page-level metadata
 * (title, description, og:image, etc.)
 */
export default function decorate(block) {
  // Metadata block should not render - it's processed by the page loader
  block.closest('.metadata-wrapper')?.remove();
}

const TARGET_FOOTER_CONTENT_BLOCK_SECTIONS = [
  'about-us',
  'how-works',
  'leadership',
  'careers'
];

const isFooterContentBlocksEnabled = () => {
  return process.env.FOOTER_CONTENT_BLOCKS_ENABLED === 'true';
};

const canUseContentBlocksForSection = (sectionName) => {
  if (!sectionName) return false;
  return (
    isFooterContentBlocksEnabled() &&
    TARGET_FOOTER_CONTENT_BLOCK_SECTIONS.includes(sectionName)
  );
};

module.exports = {
  TARGET_FOOTER_CONTENT_BLOCK_SECTIONS,
  isFooterContentBlocksEnabled,
  canUseContentBlocksForSection
};

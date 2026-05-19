/**
 * Footer Service - Refactored with helpers for optimized queries
 * Maintains exact same API responses for backward compatibility
 * Uses optimized single-query operations for minimum response time
 */

const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');
const Footer = require('../../models/Footer.model');
const { canUseContentBlocksForSection } = require('../../config/footerContentBlocks');
const {
  LAST_EDITED_BY_POPULATE,
  checkDuplicateSection,
  getAllSectionsOptimized,
  getSectionByIdOptimized,
  getSectionByNameOptimized,
  findByIdAndUpdatePopulate,
  findByNameAndUpdatePopulate,
  updateSectionStatus,
  createSectionWithPopulate,
  deleteSectionById
} = require('../../helpers/footer.helper');

const normalizeContentBlocks = (contentBlocks) => {
  if (!Array.isArray(contentBlocks)) {
    throw new AppError('contentBlocks must be an array', 400);
  }

  const seenBlockIds = new Set();

  const normalizedBlocks = contentBlocks.map((block, blockIndex) => {
    if (!block || typeof block !== 'object' || Array.isArray(block)) {
      throw new AppError(`contentBlocks[${blockIndex}] must be an object`, 400);
    }

    if (typeof block.blockId !== 'string' || block.blockId.trim().length === 0) {
      throw new AppError(`contentBlocks[${blockIndex}].blockId is required`, 400);
    }

    const normalizedBlockId = block.blockId.trim();
    if (seenBlockIds.has(normalizedBlockId)) {
      throw new AppError(`Duplicate blockId '${normalizedBlockId}' in contentBlocks`, 400);
    }
    seenBlockIds.add(normalizedBlockId);

    if (!Number.isInteger(block.order) || block.order < 0) {
      throw new AppError(`contentBlocks[${blockIndex}].order must be a non-negative integer`, 400);
    }

    if (block.title !== undefined && typeof block.title !== 'string') {
      throw new AppError(`contentBlocks[${blockIndex}].title must be a string`, 400);
    }

    if (block.subTitle !== undefined && typeof block.subTitle !== 'string') {
      throw new AppError(`contentBlocks[${blockIndex}].subTitle must be a string`, 400);
    }

    if (block.content !== undefined && typeof block.content !== 'string') {
      throw new AppError(`contentBlocks[${blockIndex}].content must be a string`, 400);
    }

    if (!Array.isArray(block.listContent)) {
      throw new AppError(`contentBlocks[${blockIndex}].listContent must be an array`, 400);
    }

    const listContent = block.listContent.map((item, listIndex) => {
      if (typeof item !== 'string') {
        throw new AppError(`contentBlocks[${blockIndex}].listContent[${listIndex}] must be a string`, 400);
      }
      return item;
    });

    if (!Array.isArray(block.images)) {
      throw new AppError(`contentBlocks[${blockIndex}].images must be an array`, 400);
    }

    const images = block.images.map((image, imageIndex) => {
      if (!image || typeof image !== 'object' || Array.isArray(image)) {
        throw new AppError(`contentBlocks[${blockIndex}].images[${imageIndex}] must be an object`, 400);
      }

      if (typeof image.url !== 'string' || image.url.trim().length === 0) {
        throw new AppError(`contentBlocks[${blockIndex}].images[${imageIndex}].url is required`, 400);
      }

      if (image.alt !== undefined && typeof image.alt !== 'string') {
        throw new AppError(`contentBlocks[${blockIndex}].images[${imageIndex}].alt must be a string`, 400);
      }

      if (image.caption !== undefined && typeof image.caption !== 'string') {
        throw new AppError(`contentBlocks[${blockIndex}].images[${imageIndex}].caption must be a string`, 400);
      }

      return {
        url: image.url.trim(),
        alt: typeof image.alt === 'string' ? image.alt : '',
        caption: typeof image.caption === 'string' ? image.caption : ''
      };
    });

    return {
      blockId: normalizedBlockId,
      order: block.order,
      title: typeof block.title === 'string' ? block.title : '',
      subTitle: typeof block.subTitle === 'string' ? block.subTitle : '',
      listContent,
      content: typeof block.content === 'string' ? block.content : '',
      images
    };
  });

  return normalizedBlocks.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.blockId.localeCompare(b.blockId);
  });
};

const applyContentBlocksReadPolicy = (sectionDoc) => {
  if (!sectionDoc) return sectionDoc;

  if (!canUseContentBlocksForSection(sectionDoc.section)) {
    delete sectionDoc.contentBlocks;
    return sectionDoc;
  }

  if (!Array.isArray(sectionDoc.contentBlocks)) {
    sectionDoc.contentBlocks = [];
    return sectionDoc;
  }

  sectionDoc.contentBlocks = [...sectionDoc.contentBlocks].sort((a, b) => {
    const aOrder = Number.isInteger(a?.order) ? a.order : Number.MAX_SAFE_INTEGER;
    const bOrder = Number.isInteger(b?.order) ? b.order : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return String(a?.blockId || '').localeCompare(String(b?.blockId || ''));
  });

  return sectionDoc;
};

const applyContentBlocksReadPolicyToList = (sections = []) => {
  return sections.map(applyContentBlocksReadPolicy);
};

const applyContentBlocksWritePolicy = async (sectionName, data = {}) => {
  if (!Object.prototype.hasOwnProperty.call(data, 'contentBlocks')) {
    return data;
  }

  if (!canUseContentBlocksForSection(sectionName)) {
    delete data.contentBlocks;
    return data;
  }

  data.contentBlocks = normalizeContentBlocks(data.contentBlocks);
  return data;
};

const resolveSectionNameForUpdateById = async (sectionId, requestedSectionName) => {
  if (requestedSectionName) return requestedSectionName;

  const existingSection = await Footer.findById(sectionId).select('section').lean();
  if (!existingSection) {
    throw new AppError('Footer section not found', 404);
  }

  return existingSection.section;
};

// ============ READ OPERATIONS (Optimized) ============

/**
 * Get all footer sections
 * Uses single optimized query with filter, sort, and populate
 */
exports.getAllFooterSections = async (query = {}, isPublic = false) => {
  const sections = await getAllSectionsOptimized(query, isPublic);
  return applyContentBlocksReadPolicyToList(sections);
};

/**
 * Get full footer payload in a single response
 * Returns both ordered list and section-keyed map for easy frontend consumption
 */
exports.getFullFooter = async (query = {}, isPublic = false) => {
  const sections = applyContentBlocksReadPolicyToList(
    await getAllSectionsOptimized(query, isPublic)
  );

  const sectionMap = sections.reduce((acc, sectionDoc) => {
    acc[sectionDoc.section] = sectionDoc;
    return acc;
  }, {});

  return {
    totalSections: sections.length,
    sections,
    sectionMap
  };
};

/**
 * Get footer section by section name
 * Returns null instead of throwing - allows frontend to handle gracefully
 */
exports.getFooterSectionBySection = async (sectionName) => {
  return applyContentBlocksReadPolicy(
    await getSectionByNameOptimized(sectionName)
  );
};

/**
 * Get footer section by ID
 * Returns null instead of throwing - allows frontend to handle gracefully
 */
exports.getFooterSectionById = async (sectionId, isPublic = false) => {
  return applyContentBlocksReadPolicy(
    await getSectionByIdOptimized(sectionId, isPublic)
  );
};

// ============ CREATE OPERATION (Optimized) ============

/**
 * Create footer section
 * Uses createSectionWithPopulate for single transaction
 */
exports.createFooterSection = async (data, userId) => {
  await applyContentBlocksWritePolicy(data.section, data);
  const section = await createSectionWithPopulate(data, userId);

  logger.info('Footer section created', {
    sectionId: section._id,
    section: section.section,
    createdBy: userId
  });

  return applyContentBlocksReadPolicy(section);
};

// ============ UPDATE OPERATIONS (Optimized) ============

/**
 * Update footer section by ID
 * Uses findByIdAndUpdatePopulate for single query operation
 */
exports.updateFooterSection = async (sectionId, data, userId) => {
  // Check duplicate if section name is being changed
  if (data.section) {
    await checkDuplicateSection(data.section, sectionId);
  }

  if (Object.prototype.hasOwnProperty.call(data, 'contentBlocks')) {
    const sectionNameForPolicy = await resolveSectionNameForUpdateById(sectionId, data.section);
    await applyContentBlocksWritePolicy(sectionNameForPolicy, data);
  }

  const section = await findByIdAndUpdatePopulate(sectionId, data, userId);

  logger.info('Footer section updated', {
    sectionId: section._id,
    section: section.section,
    updatedBy: userId
  });

  return applyContentBlocksReadPolicy(section);
};

/**
 * Update footer section by section name
 * Uses findByNameAndUpdatePopulate for single query operation
 */
exports.updateFooterSectionBySection = async (sectionName, data, userId) => {
  await applyContentBlocksWritePolicy(sectionName, data);
  const section = await findByNameAndUpdatePopulate(sectionName, data, userId);

  logger.info('Footer section updated by section name', {
    sectionId: section._id,
    section: section.section,
    updatedBy: userId
  });

  return applyContentBlocksReadPolicy(section);
};

// ============ DELETE OPERATION (Optimized) ============

/**
 * Delete footer section
 * Uses findByIdAndDelete for single query operation
 */
exports.deleteFooterSection = async (sectionId) => {
  const result = await deleteSectionById(sectionId);

  logger.info('Footer section deleted', {
    deletedSection: result.deletedSection
  });

  return result;
};

// ============ STATUS OPERATIONS (Optimized) ============

/**
 * Publish footer section
 * Uses updateSectionStatus for single query operation
 */
exports.publishFooterSection = async (sectionId, userId) => {
  const section = await updateSectionStatus(sectionId, 'published', userId);

  logger.info('Footer section published', {
    sectionId: section._id,
    section: section.section,
    publishedBy: userId
  });

  return applyContentBlocksReadPolicy(section);
};

/**
 * Save as draft
 * Uses updateSectionStatus for single query operation
 */
exports.saveAsDraft = async (sectionId, userId) => {
  const section = await updateSectionStatus(sectionId, 'draft', userId);

  logger.info('Footer section saved as draft', {
    sectionId: section._id,
    section: section.section,
    savedBy: userId
  });

  return applyContentBlocksReadPolicy(section);
};

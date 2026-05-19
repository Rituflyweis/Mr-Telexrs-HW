#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../src/config/db');
const Footer = require('../src/models/Footer.model');
const {
  TARGET_FOOTER_CONTENT_BLOCK_SECTIONS
} = require('../src/config/footerContentBlocks');

const hasArg = (arg) => process.argv.includes(arg);
const isDryRun = !hasArg('--apply');

const buildSeedBlock = (sectionDoc) => ({
  blockId: `${sectionDoc.section}-${sectionDoc._id.toString()}-legacy-0`,
  order: 0,
  title: sectionDoc.title || '',
  subTitle: '',
  listContent: [],
  content: sectionDoc.content,
  images: []
});

const hasLegacyContent = (sectionDoc) => {
  return typeof sectionDoc.content === 'string' && sectionDoc.content.trim().length > 0;
};

const hasContentBlocks = (sectionDoc) => {
  return Array.isArray(sectionDoc.contentBlocks) && sectionDoc.contentBlocks.length > 0;
};

const run = async () => {
  const summary = {
    scanned: 0,
    skippedAlreadyStructured: 0,
    skippedNoLegacyContent: 0,
    candidates: 0,
    updated: 0
  };

  console.log(`[footer-content-blocks-backfill] Mode: ${isDryRun ? 'DRY RUN' : 'APPLY'}`);
  console.log(
    `[footer-content-blocks-backfill] Target sections: ${TARGET_FOOTER_CONTENT_BLOCK_SECTIONS.join(', ')}`
  );

  await connectDB();

  const docs = await Footer.find({
    section: { $in: TARGET_FOOTER_CONTENT_BLOCK_SECTIONS }
  }).lean();

  summary.scanned = docs.length;

  for (const doc of docs) {
    if (hasContentBlocks(doc)) {
      summary.skippedAlreadyStructured += 1;
      console.log(
        `[skip][already-structured] section=${doc.section} id=${doc._id.toString()} blocks=${doc.contentBlocks.length}`
      );
      continue;
    }

    if (!hasLegacyContent(doc)) {
      summary.skippedNoLegacyContent += 1;
      console.log(
        `[skip][no-legacy-content] section=${doc.section} id=${doc._id.toString()}`
      );
      continue;
    }

    summary.candidates += 1;
    const seedBlock = buildSeedBlock(doc);

    if (isDryRun) {
      console.log(
        `[dry-run][candidate] section=${doc.section} id=${doc._id.toString()} blockId=${seedBlock.blockId}`
      );
      continue;
    }

    const result = await Footer.updateOne(
      { _id: doc._id, $or: [{ contentBlocks: { $exists: false } }, { contentBlocks: { $size: 0 } }] },
      { $set: { contentBlocks: [seedBlock] } }
    );

    if (result.modifiedCount > 0) {
      summary.updated += 1;
      console.log(
        `[updated] section=${doc.section} id=${doc._id.toString()} blockId=${seedBlock.blockId}`
      );
    } else {
      console.log(
        `[skip][race-or-updated] section=${doc.section} id=${doc._id.toString()}`
      );
    }
  }

  console.log('[footer-content-blocks-backfill] Summary:', summary);
};

run()
  .catch((err) => {
    console.error('[footer-content-blocks-backfill] Failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async function() {
  const inputPath = './public/code-spark-1.png';
  const outputDir = './public';

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error('❌ Input file not found:', inputPath);
    process.exit(1);
  }

  console.log('🔄 Generating optimized favicons from code-spark-1.png...');

  const sizes = [16, 32, 48, 64, 96, 128, 192, 256, 384, 512];

  try {
    // Generate PNG files for different sizes
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}.png`);
      await sharp(inputPath)
        .resize(size, size, { fit: 'cover', position: 'center' })
        .png({ quality: 90 })
        .toFile(outputPath);
      console.log(`✅ Generated icon-${size}.png`);
    }

    // Generate apple-touch-icon.png (180x180)
    const appleIconPath = path.join(outputDir, 'apple-touch-icon.png');
    await sharp(inputPath)
      .resize(180, 180, { fit: 'cover', position: 'center' })
      .png({ quality: 90 })
      .toFile(appleIconPath);
    console.log('✅ Generated apple-touch-icon.png');

    // Generate og-image.png for social media (1200x630)
    const ogImagePath = path.join(outputDir, 'og-image.png');
    await sharp(inputPath)
      .resize(1200, 630, { fit: 'cover', position: 'center' })
      .png({ quality: 95 })
      .toFile(ogImagePath);
    console.log('✅ Generated og-image.png (1200x630 for social media)');

    console.log('\n🎉 Favicon generation complete!');
    console.log('Generated files:');
    sizes.forEach(size => console.log(`  - icon-${size}.png`));
    console.log('  - apple-touch-icon.png');
    console.log('  - og-image.png');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
})();

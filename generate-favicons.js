#!/usr/bin/env node

const { generateFavicons } = require('./favicon-generator');

(async function() {
  try {
    console.log('Generating favicons from code-spark-1.png...');
    const res = await generateFavicons('./public/code-spark-1.png', './public', {
      name: 'CodeSpark',
      theme_color: '#3b82f6',
      background_color: '#ffffff'
    });
    console.log('✅ Done! Files written to', res.outDir);
    console.log('Generated files:');
    console.log('- PNG icons:', res.pngs.length, 'files');
    if (res.ico) console.log('- favicon.ico created');
    if (res.manifest) console.log('- manifest.json updated');
    if (res.browserconfig) console.log('- browserconfig.xml updated');
    if (res.apple) console.log('- apple-touch-icon.png created');
    console.log('\nHTML head snippet saved to:', res.htmlSnippetPath);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();

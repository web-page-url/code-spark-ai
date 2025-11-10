const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default || require('png-to-ico');
const { mkdirp } = require('mkdirp');

const DEFAULT_SIZES = [16, 32, 48, 64, 96, 128, 192, 256, 384, 512];
const EXTRA_APP_SIZES = [120, 144, 152, 167, 180, 192, 256, 384, 512]; // apple/android useful

async function ensureDir(dir) {
  await mkdirp(dir);
}

function safeJoin(dir, filename) {
  return path.join(dir, filename);
}

/**
 * generateFavicons - generate PNGs, favicon.ico, manifest.json, browserconfig.xml and HTML snippets
 * @param {string} inputPath - path to source image (preferably square, >=1024px)
 * @param {string} outDir - output directory
 * @param {object} options - optional
 *    options.name - site name for manifest
 *    options.theme_color - theme color for manifest
 *    options.background_color - background color for manifest
 *    options.sizes - array of integer sizes to generate PNGs for
 *    options.iconPrefix - prefix for icon filenames
 * @returns {object} result containing generated file paths and an HTML snippet
 */
async function generateFavicons(inputPath, outDir, options = {}) {
  if (!inputPath) throw new Error('inputPath is required');
  const src = inputPath;
  options = Object.assign({
    name: 'CodeSpark',
    theme_color: '#3b82f6',
    background_color: '#ffffff',
    sizes: DEFAULT_SIZES.concat(EXTRA_APP_SIZES),
    iconPrefix: 'icon-'
  }, options);

  await ensureDir(outDir);

  const sizes = Array.from(new Set(options.sizes)).sort((a,b)=>a-b);
  const generatedPNGs = [];

  // Generate PNG files
  for (const s of sizes) {
    const filename = `${options.iconPrefix}${s}.png`;
    const outPath = safeJoin(outDir, filename);
    // Use sharp to resize with "cover" to preserve square crop and high quality
    await sharp(src)
      .resize(s, s, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(outPath);
    generatedPNGs.push({ size: s, file: filename, path: outPath });
  }

  // Create favicon.ico from 16,32,48 if available (png-to-ico expects buffers of pngs)
  const icoSizes = [16, 32, 48].filter(sz => sizes.includes(sz));
  let icoPath = null;
  if (icoSizes.length > 0) {
    const buffers = await Promise.all(icoSizes.map(sz => {
      const p = safeJoin(outDir, `${options.iconPrefix}${sz}.png`);
      return fs.promises.readFile(p);
    }));
    const icoBuffer = await pngToIco(buffers);
    icoPath = safeJoin(outDir, 'favicon.ico');
    await fs.promises.writeFile(icoPath, icoBuffer);
  }

  // produce browserconfig.xml (used by some Microsoft tiles)
  const browserConfig = `<?xml version="1.0" encoding="utf-8"?>\n<browserconfig>\n  <msapplication>\n    <tile>\n      <square150x150logo src="/${options.iconPrefix}150.png"/>\n      <TileColor>${options.theme_color}</TileColor>\n    </tile>\n  </msapplication>\n</browserconfig>`;

  await fs.promises.writeFile(safeJoin(outDir, 'browserconfig.xml'), browserConfig);

  // manifest.json for Android
  const manifestIcons = generatedPNGs
    .filter(i => i.size >= 48)
    .map(i => ({ src: `/${i.file}`, sizes: `${i.size}x${i.size}`, type: 'image/png', purpose: 'any' }));

  const manifest = {
    name: options.name,
    short_name: options.name,
    icons: manifestIcons,
    theme_color: options.theme_color,
    background_color: options.background_color,
    display: 'standalone'
  };

  await fs.promises.writeFile(safeJoin(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // Create apple-touch-icon (pick 180 if exists)
  const appleSize = sizes.includes(180) ? 180 : (sizes.find(s => s>=180) || 180);
  const appleFilename = `apple-touch-icon.png`;
  if (!generatedPNGs.find(p=>p.size===appleSize)) {
    await sharp(src).resize(appleSize, appleSize, { fit: 'cover' }).png().toFile(safeJoin(outDir, appleFilename));
  } else {
    // copy the existing one
    await fs.promises.copyFile(safeJoin(outDir, `${options.iconPrefix}${appleSize}.png`), safeJoin(outDir, appleFilename));
  }

  // HTML snippet for insertion in <head>
  const htmlLines = [];
  if (icoPath) htmlLines.push(`<link rel="shortcut icon" href="/favicon.ico">`);

  // PNG favicons (common ones)
  const common = [16,32,48,96,192,512].filter(s=>sizes.includes(s));
  for (const s of common) {
    const f = `/${options.iconPrefix}${s}.png`;
    htmlLines.push(`<link rel="icon" type="image/png" sizes="${s}x${s}" href="${f}">`);
  }

  htmlLines.push(`<link rel="apple-touch-icon" href="/${appleFilename}">`);
  htmlLines.push(`<link rel="manifest" href="/manifest.json">`);
  htmlLines.push(`<meta name="theme-color" content="${options.theme_color}">`);

  // write an index.html snippet file
  const htmlSnippet = htmlLines.join('\n');
  await fs.promises.writeFile(safeJoin(outDir, 'favicon-head-snippet.html'), htmlSnippet);

  // Return paths & snippet
  return {
    outDir: path.resolve(outDir),
    pngs: generatedPNGs.map(p => ({ size: p.size, file: p.file, path: path.resolve(p.path) })),
    ico: icoPath ? path.resolve(icoPath) : null,
    manifest: path.resolve(safeJoin(outDir, 'manifest.json')),
    browserconfig: path.resolve(safeJoin(outDir, 'browserconfig.xml')),
    apple: path.resolve(safeJoin(outDir, 'apple-touch-icon.png')),
    htmlSnippetPath: path.resolve(safeJoin(outDir, 'favicon-head-snippet.html'))
  };
}

module.exports = { generateFavicons };

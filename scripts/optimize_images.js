const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDirs = [
  path.join(__dirname, '..', 'public', 'images')
];

function getAllImages(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllImages(fullPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        results.push({ path: fullPath, size: stat.size, ext });
      }
    }
  }
  return results;
}

async function optimizeImage(img) {
  // Only process if image is > 100KB
  if (img.size < 100 * 1024) return;

  try {
    const inputBuffer = fs.readFileSync(img.path);
    const meta = await sharp(inputBuffer).metadata();
    const maxWidth = 2000;
    const shouldResize = meta.width && meta.width > maxWidth;

    let pipeline = sharp(inputBuffer);
    if (shouldResize) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }

    let outputBuffer;
    if (img.ext === '.png') {
      outputBuffer = await pipeline.png({ quality: 85, compressionLevel: 9 }).toBuffer();
    } else {
      outputBuffer = await pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer();
    }

    if (outputBuffer.length < img.size) {
      fs.writeFileSync(img.path, outputBuffer);
      console.log(`Optimized ${path.basename(img.path)}: ${(img.size/1024).toFixed(0)}KB -> ${(outputBuffer.length/1024).toFixed(0)}KB (-${Math.round((1 - outputBuffer.length/img.size)*100)}%)`);
    } else {
      console.log(`Skipped ${path.basename(img.path)} (already optimal)`);
    }
  } catch (err) {
    console.error(`Error optimizing ${img.path}:`, err.message);
  }
}

async function run() {
  const images = targetDirs.flatMap(getAllImages).sort((a,b) => b.size - a.size);
  console.log(`Found ${images.length} images to inspect.`);
  let initialTotal = 0;
  let finalTotal = 0;
  for (const img of images) {
    initialTotal += img.size;
    await optimizeImage(img);
    finalTotal += fs.statSync(img.path).size;
  }
  console.log(`Finished optimization! Initial: ${(initialTotal/1024/1024).toFixed(2)} MB -> Final: ${(finalTotal/1024/1024).toFixed(2)} MB. Saved: ${((initialTotal - finalTotal)/1024/1024).toFixed(2)} MB (-${Math.round((1 - finalTotal/initialTotal)*100)}%)`);
}

run();

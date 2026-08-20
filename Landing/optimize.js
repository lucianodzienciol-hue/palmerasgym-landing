const path = require('path');
const fs = require('fs');
const sharp = require(path.resolve(__dirname, '..', 'node_modules', 'sharp'));

const SRC = path.resolve(__dirname, '..', 'Media');
const DEST = path.join(SRC, 'web');

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

const IMG_EXTS = ['.jpg', '.jpeg', '.jpe'];
const VID_EXTS = ['.mp4', '.mov', '.webm'];

const files = fs.readdirSync(SRC).filter(f => !fs.statSync(path.join(SRC, f)).isDirectory());

const images = files.filter(f => IMG_EXTS.includes(path.extname(f).toLowerCase())).sort();
const videos = files.filter(f => VID_EXTS.includes(path.extname(f).toLowerCase())).sort();

(async () => {
  let i = 1;
  const total = images.length;
  for (const file of images) {
    const name = String(i).padStart(2, '0');
    const out = path.join(DEST, 'photo_' + name + '.webp');
    try {
      const info = await sharp(path.join(SRC, file))
        .rotate()
        .resize({ width: 1200, height: 800, fit: 'cover', position: 'centre' })
        .webp({ quality: 82 })
        .toFile(out);
      console.log('OK  photo_' + name + '.webp  (' + file + ')  ' + Math.round(info.size / 1024) + 'KB');
    } catch (e) {
      console.log('ERR photo_' + name + '.webp  (' + file + ')  ' + e.message);
    }
    i++;
  }

  try {
    const bgOut = path.join(DEST, 'parallax-bg.webp');
    const info = await sharp(path.join(SRC, images[0]))
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(bgOut);
    console.log('OK  parallax-bg.webp  (from ' + images[0] + ')  ' + Math.round(info.size / 1024) + 'KB');
  } catch (e) {
    console.log('ERR parallax-bg.webp  ' + e.message);
  }

  videos.forEach((file, idx) => {
    const name = 'video-' + (idx + 1) + path.extname(file).toLowerCase();
    try {
      fs.copyFileSync(path.join(SRC, file), path.join(DEST, name));
      console.log('OK  ' + name + '  (from ' + file + ')');
    } catch (e) {
      console.log('ERR ' + name + '  ' + e.message);
    }
  });

  console.log('\nTotal fotos: ' + total + ' | Videos: ' + videos.length);
})();
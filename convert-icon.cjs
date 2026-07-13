const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'logo.svg');
const pngPath = path.join(__dirname, 'public', 'logo.png');

sharp(svgPath)
  .resize(512, 512)
  .png()
  .toFile(pngPath)
  .then(() => {
    console.log('Icon converted to 512x512 PNG successfully.');
  })
  .catch(err => {
    console.error('Error converting icon:', err);
    process.exit(1);
  });

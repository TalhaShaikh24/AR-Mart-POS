const fs = require('fs');
const { PNG } = require('pngjs');

function makeTransparent(inputPath, outputPath) {
  fs.createReadStream(inputPath)
    .pipe(new PNG({ filterType: 4 }))
    .on('parsed', function() {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = (this.width * y + x) << 2;
          const r = this.data[idx];
          const g = this.data[idx + 1];
          const b = this.data[idx + 2];

          // If the pixel is pure or near white (r, g, b > 238)
          if (r > 240 && g > 240 && b > 240) {
            this.data[idx + 3] = 0; // Alpha = 0 (Transparent)
          } else if (r > 215 && g > 215 && b > 215) {
            // Anti-aliasing / soft edge blend
            const avg = (r + g + b) / 3;
            const factor = (240 - avg) / (240 - 215);
            this.data[idx + 3] = Math.max(0, Math.min(255, Math.round(255 * factor)));
          }
        }
      }

      this.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
        console.log(`Saved transparent logo to ${outputPath}`);
      });
    });
}

makeTransparent('public/ar-mart-logo.png', 'public/ar-mart-logo.png');
makeTransparent('src/assets/ar-mart-logo.png', 'src/assets/ar-mart-logo.png');

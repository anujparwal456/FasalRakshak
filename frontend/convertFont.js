const fs = require('fs');
const path = require('path');

// Use absolute path with forward slashes
const fontPath = './fonts/NotoSerifDevanagari-Regular.ttf';
const outputFile = path.join(__dirname, 'devanagariFont.js');

try {
    // Read font file
    const fontData = fs.readFileSync(fontPath);

    // Convert to Base64
    const b64 = fontData.toString('base64');

    // Write JS file
    const jsContent = `export const DEVANAGARI_FONT_BASE64 = "${b64}";\n`;

    fs.writeFileSync(outputFile, jsContent);
    console.log('✅ devanagariFont.js created successfully!');
} catch (err) {
    console.error('❌ Error creating devanagariFont.js:', err);
}

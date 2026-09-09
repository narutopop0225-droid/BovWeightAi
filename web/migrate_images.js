const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();

function saveBase64Image(base64Str, prefix) {
  if (!base64Str || !base64Str.startsWith('data:image')) return base64Str;
  
  try {
    const matches = base64Str.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Str;

    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');
    
    // Hash buffer for unique filename
    const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
    const filename = `${prefix}_${hash}.${extension}`;
    const filePath = path.join('c:', 'Users', 'narut', 'OneDrive', 'เอกสาร', 'ปัญหาพิเศษ', 'เล่มปัญหาพิเศษ', 'งานใหม่', 'SmartCattleWeightApp', 'web', 'public', 'uploads', filename);
    
    fs.writeFileSync(filePath, imageBuffer);
    console.log(`Saved image: ${filename}`);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Error saving image:', err);
    return base64Str;
  }
}

async function run() {
  console.log('Starting image migration...');
  
  // Migrate Animals
  const animals = await prisma.animal.findMany();
  for (const animal of animals) {
    if (animal.image && animal.image.startsWith('data:image')) {
      const newPath = saveBase64Image(animal.image, `animal_${animal.id}`);
      if (newPath !== animal.image) {
        await prisma.animal.update({
          where: { id: animal.id },
          data: { image: newPath }
        });
      }
    }
  }
  
  // Migrate Measurements
  const measurements = await prisma.measurement.findMany();
  for (const m of measurements) {
    if (m.scanImage && m.scanImage.startsWith('data:image')) {
      const newPath = saveBase64Image(m.scanImage, `scan_${m.id}`);
      if (newPath !== m.scanImage) {
        await prisma.measurement.update({
          where: { id: m.id },
          data: { scanImage: newPath }
        });
      }
    }
  }
  
  console.log('Migration complete!');
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

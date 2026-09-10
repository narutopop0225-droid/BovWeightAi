import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const animals = await prisma.animal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        measurements: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });
    return NextResponse.json(animals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function saveBase64Image(base64Str: string, prefix: string): string {
  if (!base64Str || !base64Str.startsWith('data:image')) return base64Str;
  
  // On Vercel, file system is read-only. Save as base64 directly to DB.
  if (process.env.VERCEL) {
    return base64Str;
  }

  try {
    const matches = base64Str.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Str;

    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');
    
    const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
    const filename = `${prefix}_${hash}.${extension}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    
    if (!fs.existsSync(path.join(process.cwd(), 'public', 'uploads'))) {
      fs.mkdirSync(path.join(process.cwd(), 'public', 'uploads'), { recursive: true });
    }
    fs.writeFileSync(filePath, imageBuffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Error saving image:', err);
    return base64Str;
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let { id, name, type, age, image, measurements } = data;

    if (image) image = saveBase64Image(image, `animal_${id}`);

    // Check if animal exists
    const existingAnimal = await prisma.animal.findUnique({ where: { id } });
    
    let animal;
    if (existingAnimal) {
      animal = await prisma.animal.update({
        where: { id },
        data: {
          image: image || existingAnimal.image, // Update image to latest scan
          // Do not overwrite name and type with generic values if it's an existing animal
          name: (name && name !== id) ? name : existingAnimal.name,
          type: type || existingAnimal.type,
          age: age || existingAnimal.age,
        }
      });
    } else {
      animal = await prisma.animal.create({
        data: { id, name, type, age, image },
      });
    }

    if (measurements && measurements.length > 0) {
      for (const m of measurements) {
        let finalScanImage = m.scanImage;
        if (finalScanImage) {
          finalScanImage = saveBase64Image(finalScanImage, `scan_${animal.id}_${m.attempt || Date.now()}`);
        }
        
        await prisma.measurement.create({
          data: {
            animalId: animal.id,
            attempt: m.attempt,
            date: m.date,
            time: m.time,
            timestamp: m.timestamp || 0,
            scanImage: finalScanImage,
            aiGirth: m.aiGirth,
            aiHeight: m.aiHeight,
            aiWeight: m.aiWeight,
            realGirth: m.realGirth,
            realHeight: m.realHeight,
            realWeight: m.realWeight,
            isFavorite: m.isFavorite || false,
            isDeleted: m.isDeleted || false,
          }
        });
      }
    }

    return NextResponse.json(animal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const animal = await prisma.animal.findUnique({
      where: { id },
      include: {
        measurements: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }
    return NextResponse.json(animal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const permanent = url.searchParams.get("permanent") === "true";
    
    if (permanent) {
      // Hard delete
      // Note: Cascade deletion is needed if there are related measurements, but Prisma schema might not have it.
      // Manually delete measurements first just in case.
      await prisma.measurement.deleteMany({ where: { animalId: id } });
      await prisma.animal.delete({ where: { id } });
    } else {
      // Soft delete the animal
      await prisma.animal.update({
        where: { id },
        data: { isDeleted: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedAnimal = await prisma.animal.update({
      where: { id },
      data: {
        isDeleted: body.isDeleted !== undefined ? body.isDeleted : undefined,
      }
    });

    return NextResponse.json(updatedAnimal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

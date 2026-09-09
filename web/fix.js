const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const animals = await prisma.animal.findMany({
    include: {
      measurements: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  for (const animal of animals) {
    let currentAttempt = 1;
    let seenSignatures = new Set();
    
    for (const m of animal.measurements) {
      // Create a signature to detect spam/duplicate clicks (same aiWeight, height, girth, close timestamps or same attempt)
      const sig = `${m.aiWeight}-${m.aiHeight}-${m.aiGirth}-${m.timestamp === 0 ? 'ts0' : Math.floor(m.timestamp / 100000)}`;
      
      if (seenSignatures.has(sig)) {
        // It's a duplicate due to frantic clicking, delete it
        console.log(`Deleting duplicate measurement ${m.id} for ${animal.id}`);
        await prisma.measurement.delete({ where: { id: m.id } });
      } else {
        seenSignatures.add(sig);
        
        // Update the valid one to have a correct sequential attempt number
        await prisma.measurement.update({
          where: { id: m.id },
          data: {
            attempt: currentAttempt,
            timestamp: m.timestamp === 0 ? m.createdAt.getTime() : m.timestamp
          }
        });
        currentAttempt++;
      }
    }
  }
  console.log("Fixed duplicates and attempts!");
}

fix().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import 'dotenv/config';

const prisma = new PrismaClient();

// Helper function to hash voter identity
function hashVoterIdentity(nationalId: string): string {
  const salt = process.env.SYSTEM_SALT || 'demo-system-salt-change-in-production-2024';
  return crypto.createHash('sha256').update(nationalId + salt).digest('hex');
}

async function main() {
  console.log('Starting database seed...');

  // Create test election
  const election = await prisma.election.create({
    data: {
      name: 'Test General Election 2026',
      description: 'Test election for development and demonstration',
      startTime: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
      status: 'draft',
      allowRevoting: true,
      revotingWindowMinutes: 30,
      createdBy: 'admin-001',
    },
  });

  console.log(`Created election: ${election.name} (${election.id})`);

  // Create test candidates
  const candidates = [
    {
      name: 'Alice Johnson',
      party: 'Progressive Party',
      constituencyId: 'const-001',
      manifesto: 'Building a better future for all citizens',
    },
    {
      name: 'Bob Smith',
      party: 'Conservative Alliance',
      constituencyId: 'const-001',
      manifesto: 'Preserving our values and traditions',
    },
    {
      name: 'Carol Davis',
      party: 'Independent',
      constituencyId: 'const-001',
      manifesto: 'Independent voice for the people',
    },
    {
      name: 'David Wilson',
      party: 'Progressive Party',
      constituencyId: 'const-002',
      manifesto: 'Innovation and progress',
    },
    {
      name: 'Emma Brown',
      party: 'Conservative Alliance',
      constituencyId: 'const-002',
      manifesto: 'Stability and security',
    },
  ];

  for (const candidateData of candidates) {
    const candidate = await prisma.candidate.create({
      data: {
        ...candidateData,
        electionId: election.id,
      },
    });
    console.log(`Created candidate: ${candidate.name} (${candidate.party})`);
  }

  // Create test voters
  const testVoters = [
    { nationalId: '123456789012', constituencyId: 'const-001', password: 'TestPass123!' },
    { nationalId: '123456789013', constituencyId: 'const-001', password: 'TestPass123!' },
    { nationalId: '123456789014', constituencyId: 'const-002', password: 'TestPass123!' },
  ];

  for (const voterData of testVoters) {
    const voterHash = hashVoterIdentity(voterData.nationalId);
    const passwordHash = await bcrypt.hash(voterData.password, 12);

    // Create voter
    await prisma.voter.create({
      data: {
        voterHash,
        constituencyId: voterData.constituencyId,
        hasVoted: false,
        authCredentials: {
          create: {
            passwordHash,
            otpSecret: crypto.randomBytes(16).toString('hex'),
            failedAttempts: 0,
          }
        }
      },
    });

    console.log(`Created test voter: ${voterData.nationalId} (constituency: ${voterData.constituencyId})`);
  }

  // Create sample audit log entries
  await prisma.auditLog.create({
    data: {
      eventType: 'system_initialized',
      action: 'Database seeded with test data',
      metadata: JSON.stringify({
        electionCount: 1,
        candidateCount: candidates.length,
        voterCount: testVoters.length,
      }),
      severity: 'info',
    },
  });

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

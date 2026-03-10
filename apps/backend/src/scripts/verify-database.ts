import prisma from '../config/database';
import logger from '../config/logger';

async function verifyDatabase() {
  try {
    logger.info('Verifying database connection...');

    // Test connection
    await prisma.$connect();
    logger.info('✓ Database connection successful');

    // Count records in each table
    const voterCount = await prisma.voter.count();
    const electionCount = await prisma.election.count();
    const candidateCount = await prisma.candidate.count();
    const auditLogCount = await prisma.auditLog.count();

    logger.info('Database Statistics:');
    logger.info(`  - Voters: ${voterCount}`);
    logger.info(`  - Elections: ${electionCount}`);
    logger.info(`  - Candidates: ${candidateCount}`);
    logger.info(`  - Audit Logs: ${auditLogCount}`);

    // Test a simple query
    const elections = await prisma.election.findMany({
      include: {
        candidates: true,
      },
    });

    if (elections.length > 0) {
      logger.info(`\n✓ Found ${elections.length} election(s):`);
      elections.forEach((election) => {
        logger.info(`  - ${election.name} (${election.candidates.length} candidates)`);
      });
    }

    logger.info('\n✓ Database verification completed successfully!');
  } catch (error) {
    logger.error('Database verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();

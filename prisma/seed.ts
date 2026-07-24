import { PrismaClient, ApplicationStatus, InternshipTrack } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin
  const passwordHash = await bcrypt.hash('Admin@1234', 10);
  const admin = await prisma.administrator.upsert({
    where: { email: 'admin@intern.dev' },
    update: {},
    create: {
      email: 'admin@intern.dev',
      passwordHash,
      name: 'System Administrator',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Sample applicants
  const applicants = [
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      phone: '+1-555-0101',
      track: InternshipTrack.Frontend_Development,
      status: ApplicationStatus.Pending,
      coverLetter: 'I am passionate about building beautiful web interfaces.',
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com',
      phone: '+1-555-0102',
      track: InternshipTrack.Backend_Development,
      status: ApplicationStatus.Shortlisted,
      coverLetter: 'I have 2 years of experience with Node.js and PostgreSQL.',
    },
    {
      firstName: 'Carol',
      lastName: 'Davis',
      email: 'carol.davis@example.com',
      phone: '+1-555-0103',
      track: InternshipTrack.UI_UX_Design,
      status: ApplicationStatus.Accepted,
      coverLetter: 'I specialize in user-centered design and accessibility.',
      notes: 'Strong portfolio. Excellent communication skills.',
    },
    {
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@example.com',
      phone: '+1-555-0104',
      track: InternshipTrack.Mobile_Development,
      status: ApplicationStatus.Rejected,
      coverLetter: 'Looking to break into mobile development.',
      notes: 'No relevant experience yet.',
    },
    {
      firstName: 'Eva',
      lastName: 'Martinez',
      email: 'eva.martinez@example.com',
      phone: '+1-555-0105',
      track: InternshipTrack.Data_Analytics,
      status: ApplicationStatus.Pending,
      coverLetter: 'Data science enthusiast with Python and R skills.',
    },
    {
      firstName: 'Frank',
      lastName: 'Brown',
      email: 'frank.brown@example.com',
      phone: '+1-555-0106',
      track: InternshipTrack.Frontend_Development,
      status: ApplicationStatus.Shortlisted,
      coverLetter: 'React developer with 1 year of freelance experience.',
    },
    {
      firstName: 'Grace',
      lastName: 'Lee',
      email: 'grace.lee@example.com',
      phone: '+1-555-0107',
      track: InternshipTrack.Backend_Development,
      status: ApplicationStatus.Pending,
      coverLetter: 'Computer science student specializing in distributed systems.',
    },
    {
      firstName: 'Henry',
      lastName: 'Taylor',
      email: 'henry.taylor@example.com',
      phone: '+1-555-0108',
      track: InternshipTrack.Data_Analytics,
      status: ApplicationStatus.Accepted,
      coverLetter: 'Kaggle competitor with strong SQL and visualization skills.',
      notes: 'Top candidate. Start date confirmed.',
    },
    {
      firstName: 'Iris',
      lastName: 'Anderson',
      email: 'iris.anderson@example.com',
      phone: '+1-555-0109',
      track: InternshipTrack.Mobile_Development,
      status: ApplicationStatus.Shortlisted,
      coverLetter: 'Flutter and React Native developer.',
    },
    {
      firstName: 'James',
      lastName: 'Thomas',
      email: 'james.thomas@example.com',
      phone: '+1-555-0110',
      track: InternshipTrack.UI_UX_Design,
      status: ApplicationStatus.Pending,
      coverLetter: 'Graphic designer transitioning to UX.',
    },
  ];

  for (const applicant of applicants) {
    await prisma.applicant.upsert({
      where: { email: applicant.email },
      update: {},
      create: applicant,
    });
  }

  console.log(`✅ ${applicants.length} applicants seeded`);
  console.log('\n🔑 Admin credentials:');
  console.log('   Email: admin@intern.dev');
  console.log('   Password: Admin@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

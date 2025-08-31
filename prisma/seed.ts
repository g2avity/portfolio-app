import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      portfolioSlug: 'test-user',
      isPublic: true,
    },
  });

  // Create a password account for the test user
  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.hash('testpass123', 10);
  
  await prisma.account.upsert({
    where: { 
      provider_providerAccountId: {
        provider: 'credentials',
        providerAccountId: user.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: user.id,
      password: hashedPassword,
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create some sample experiences
  const experience1 = await prisma.experience.upsert({
    where: { id: 'exp-1' },
    update: {},
    create: {
      id: 'exp-1',
      title: 'Senior Developer',
      companyName: 'Tech Corp',
      description: 'Led development team and implemented new features',
      startDate: new Date('2022-01-01'),
      endDate: new Date('2023-12-31'),
      isCurrent: false,
      location: 'San Francisco, CA',
      userId: user.id,
    },
  });

  const experience2 = await prisma.experience.upsert({
    where: { id: 'exp-2' },
    update: {},
    create: {
      id: 'exp-2',
      title: 'Full Stack Developer',
      companyName: 'Startup Inc',
      description: 'Built web applications using modern technologies',
      startDate: new Date('2020-06-01'),
      endDate: new Date('2021-12-31'),
      isCurrent: false,
      location: 'Remote',
      userId: user.id,
    },
  });

  console.log('✅ Created sample experiences');

  // Create some sample skills
  const skill1 = await prisma.skill.upsert({
    where: { id: 'skill-1' },
    update: {},
    create: {
      id: 'skill-1',
      name: 'React',
      description: 'Modern JavaScript library for building user interfaces',
      category: 'Frontend',
      proficiency: 5,
      yearsOfExperience: 3,
      userId: user.id,
    },
  });

  const skill2 = await prisma.skill.upsert({
    where: { id: 'skill-2' },
    update: {},
    create: {
      id: 'skill-2',
      name: 'Node.js',
      description: 'JavaScript runtime for server-side development',
      category: 'Backend',
      proficiency: 4,
      yearsOfExperience: 2,
      userId: user.id,
    },
  });

  const skill3 = await prisma.skill.upsert({
    where: { id: 'skill-3' },
    update: {},
    create: {
      id: 'skill-3',
      name: 'TypeScript',
      description: 'Typed superset of JavaScript',
      category: 'Programming',
      proficiency: 5,
      yearsOfExperience: 3,
      userId: user.id,
    },
  });

  console.log('✅ Created sample skills');

  // Create a sample custom section
  const customSection = await prisma.customSection.upsert({
    where: { id: 'custom-1' },
    update: {},
    create: {
      id: 'custom-1',
      title: 'Projects',
      slug: 'projects',
      type: 'project-showcase',
      description: 'Showcase of my best projects',
      isPublic: true,
      order: 4,
      layout: 'default',
      content: {
        entries: [
          {
            id: 'proj-1',
            title: 'Portfolio App',
            description: 'A modern portfolio application built with React and TypeScript',
            technologies: ['React', 'TypeScript', 'Tailwind CSS'],
            githubUrl: 'https://github.com/test/portfolio',
            liveUrl: 'https://portfolio.test.com',
            imageUrl: null,
            createdAt: new Date().toISOString(),
          }
        ]
      },
      userId: user.id,
    },
  });

  console.log('✅ Created sample custom section');

  // Create a sample portfolio config
  const portfolioConfig = await prisma.portfolioConfig.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      sectionOrder: [
        { id: 'profile', type: 'profile', order: 1, isVisible: true, layout: 'default' },
        { id: 'experiences', type: 'experiences', order: 2, isVisible: true, layout: 'default' },
        { id: 'skills', type: 'skills', order: 3, isVisible: true, layout: 'default' },
        { id: 'custom-1', type: 'custom', order: 4, isVisible: true, layout: 'default', sectionId: 'projects' },
      ],
      layoutType: 'default',
      theme: 'light',
      primaryColor: '#3b82f6',
      fontFamily: 'Inter',
      spacing: 'comfortable',
      showProfileImage: true,
      showSocialLinks: true,
      showContactInfo: true,
      customCSS: null,
      animationsEnabled: true,
    },
  });

  console.log('✅ Created sample portfolio config');

  console.log('🎉 Database seeding completed successfully!');
  console.log('📊 Sample data created:');
  console.log(`   - User: ${user.email}`);
  console.log(`   - Experiences: ${experience1.title}, ${experience2.title}`);
  console.log(`   - Skills: ${skill1.name}, ${skill2.name}, ${skill3.name}`);
  console.log(`   - Custom Section: ${customSection.title}`);
  console.log(`   - Portfolio Config: ${portfolioConfig.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

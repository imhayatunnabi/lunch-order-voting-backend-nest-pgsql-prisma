import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function cleanDatabase() {
  // Delete in correct order due to foreign key constraints
  await prisma.vote.deleteMany({});
  await prisma.food.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.user.deleteMany({});
}

async function main() {
  console.log('Starting database cleanup...');
  await cleanDatabase();
  console.log('Database cleanup completed');

  // Seed Users first (keeping existing code)
  const users = [
    {
      email: 'imhayatunnabi@gmail.com',
      password: await bcrypt.hash('password123', 10),
    },
    {
      email: 'imhayatunnabi.pen@gmail.com',
      password: await bcrypt.hash('password123', 10),
    },
    {
      email: 'admin@gmail.com',
      password: await bcrypt.hash('admin123', 10),
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  // Seed Restaurants
  const restaurants = [
    { name: 'Star Kabab', address: '23/B Gulshan Avenue, Dhaka' },
    { name: "Sultan's Dine", address: '12 Banani Road, Dhaka' },
    { name: 'Kacchi Bhai', address: '45 Dhanmondi Lake Road, Dhaka' },
    { name: 'Pizza Inn', address: '78/A Uttara Sector 4, Dhaka' },
    { name: 'Burger King', address: '56 Bashundhara Block B, Dhaka' },
    { name: 'KFC Gulshan', address: '34 Gulshan Circle 2, Dhaka' },
    { name: 'Takeout', address: '89 Banani Block C, Dhaka' },
    { name: 'Madchef', address: '67 Dhanmondi Road 27, Dhaka' },
    { name: 'Chillox', address: '45/D Uttara Sector 11, Dhaka' },
    { name: "Domino's Pizza", address: '23 Bashundhara Block D, Dhaka' },
    { name: 'BFC', address: '78 Mirpur Road 12, Dhaka' },
    { name: 'Coffee World', address: '56/E Gulshan Avenue, Dhaka' },
    { name: 'Thai Express', address: '90 Banani Block F, Dhaka' },
    { name: 'Nawabi Bhoj', address: '34/B Dhanmondi Road 15, Dhaka' },
    { name: 'Bistro E', address: '67/C Uttara Sector 7, Dhaka' },
    { name: 'Cafe Italiano', address: '89/D Bashundhara Block A, Dhaka' },
    { name: 'Sushi Samurai', address: '45 Gulshan Circle 1, Dhaka' },
    { name: 'Dhaka Canton', address: '23/C Banani Block B, Dhaka' },
    { name: 'Arabian Express', address: '78/B Dhanmondi Road 8, Dhaka' },
    { name: 'Burger Queen', address: '56/F Mirpur Section 10, Dhaka' },
  ];

  console.log('Seeding restaurants...');
  for (const restaurant of restaurants) {
    try {
      await prisma.restaurant.create({
        data: restaurant,
      });
      console.log(`Created restaurant: ${restaurant.name}`);
    } catch (error) {
      console.error(`Error creating restaurant ${restaurant.name}:`, error);
    }
  }

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

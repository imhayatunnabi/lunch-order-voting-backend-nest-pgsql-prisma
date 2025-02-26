import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function cleanDatabase() {
  await prisma.vote.deleteMany({});
  await prisma.food.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.user.deleteMany({});
}

async function main() {
  console.log('Starting database cleanup...');
  await cleanDatabase();
  console.log('Database cleanup completed');
  const userSeedData = [
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

  const createdUsers = [];
  for (const userData of userSeedData) {
    const user = await prisma.user.create({
      data: userData,
    });
    createdUsers.push(user);
  }
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
  const createdRestaurants = [];
  for (const restaurant of restaurants) {
    try {
      const createdRestaurant = await prisma.restaurant.create({
        data: restaurant,
      });
      createdRestaurants.push(createdRestaurant);
      console.log(`Created restaurant: ${restaurant.name}`);
    } catch (error) {
      console.error(`Error creating restaurant ${restaurant.name}:`, error);
    }
  }
  const foodCategories = {
    Appetizers: [
      { name: 'Spring Rolls', priceRange: [150, 250] },
      { name: 'Chicken Wings', priceRange: [280, 380] },
      { name: 'French Fries', priceRange: [120, 180] },
      { name: 'Onion Rings', priceRange: [140, 200] },
    ],
    MainCourse: [
      { name: 'Beef Burger', priceRange: [350, 450] },
      { name: 'Chicken Biryani', priceRange: [280, 380] },
      { name: 'Grilled Fish', priceRange: [450, 550] },
      { name: 'Mixed Fried Rice', priceRange: [250, 350] },
    ],
    Desserts: [
      { name: 'Chocolate Cake', priceRange: [180, 280] },
      { name: 'Ice Cream', priceRange: [150, 250] },
      { name: 'Fruit Pudding', priceRange: [160, 260] },
      { name: 'Brownie', priceRange: [200, 300] },
    ],
    Beverages: [
      { name: 'Fresh Lime Soda', priceRange: [80, 120] },
      { name: 'Mango Smoothie', priceRange: [150, 200] },
      { name: 'Cold Coffee', priceRange: [160, 220] },
      { name: 'Mint Lemonade', priceRange: [100, 150] },
    ],
  };

  console.log('Seeding foods...');
  for (const restaurant of createdRestaurants) {
    console.log(`Adding foods to restaurant: ${restaurant.name}`);
    for (const [, items] of Object.entries(foodCategories)) {
      for (const item of items) {
        try {
          const price = Math.floor(
            Math.random() * (item.priceRange[1] - item.priceRange[0]) +
              item.priceRange[0],
          );

          await prisma.food.create({
            data: {
              name: `${item.name}`,
              price: price,
              restaurantId: restaurant.id,
            },
          });
          console.log(`Created food: ${item.name} in ${restaurant.name}`);
        } catch (error) {
          console.error(
            `Error creating food ${item.name} in ${restaurant.name}:`,
            error,
          );
        }
      }
    }
  }

  console.log('Seeding votes...');
  const foods = await prisma.food.findMany({
    include: { restaurant: true },
  });

  for (let daysAgo = 0; daysAgo < 5; daysAgo++) {
    const voteDate = new Date();
    voteDate.setDate(voteDate.getDate() - daysAgo);
    voteDate.setHours(0, 0, 0, 0);

    for (const user of createdUsers) {
      if (Math.random() < 0.7) {
        const randomFood = foods[Math.floor(Math.random() * foods.length)];
        try {
          await prisma.vote.create({
            data: {
              userId: user.id,
              foodId: randomFood.id,
              restaurantId: randomFood.restaurant.id,
              createdAt: voteDate,
            },
          });
          console.log(
            `Created vote by ${user.email} for ${randomFood.name} at ${randomFood.restaurant.name}`,
          );
        } catch (error) {
          console.error(`Error creating vote for ${user.email}:`, error);
        }
      }
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

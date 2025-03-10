# Lunch Order Voting System

A NestJS application for managing lunch orders and voting system.

## Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- PostgreSQL (v15 or later) - *Only needed for local development without Docker*
- Docker and Docker Compose - *Only needed for Docker deployment*

## Project Structure

```
lunch-order-voting/
├── src/                    # Source code
├── prisma/                 # Database schema and migrations
├── test/                   # Test files
├── docker/                 # Docker configuration
├── .env                    # Environment variables
├── docker-compose.yml      # Docker development configuration
└── docker-compose.prod.yml # Docker production configuration
```

## Installation & Running (Local Development)

1. Clone the repository:
```bash
git clone <repository-url>
cd lunch-order-voting
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
# If running PostgreSQL locally
createdb voting-app

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed the database
npm run seed
```

5. Start the application:
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The application will be available at `http://localhost:3000`

## Installation & Running (Docker)

1. Development mode:
```bash
# Start the application
npm run docker:dev
# or
docker-compose up --build

# Stop the application
docker-compose down
```

2. Production mode:
```bash
# Start the application
npm run docker:prod
# or
docker-compose -f docker-compose.prod.yml up --build

# Stop the application
docker-compose -f docker-compose.prod.yml down
```

The application will be available at `http://localhost:3000`

## Database Management

### Prisma Studio

Prisma Studio provides a visual interface to view and edit your database data.

1. Local Development Setup:
```bash
# First, create a .env.local file with the following content:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/voting-app?schema=public"
JWT_SECRET="your-secret-key"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=voting-app

# Start Docker containers
npm run docker:dev

# In a separate terminal, run Prisma Studio
npm run prisma:studio
```
Access Prisma Studio at `http://localhost:5555`

2. Docker Development:
```bash
# Access the API container
docker exec -it lunch-voting-api sh

# Run Prisma Studio (inside container)
npx prisma studio --host 0.0.0.0
```
Access Prisma Studio at `http://localhost:5555`

Note: The local development setup uses a separate `.env.local` file to connect to the database through `localhost` instead of the Docker network's `db` hostname. This file should be added to your `.gitignore`.

### Database Migrations

1. Local development:
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy
```

2. Docker development:
```bash
# Migrations are automatically run on container start
# To run manually:
docker exec -it lunch-voting-api npm run prisma:migrate:dev
```

### Seeding the Database

1. Local Development (outside Docker):
```bash
# Make sure Docker containers are running
npm run docker:dev

# In a separate terminal, run the seed script
npm run seed
```

2. Inside Docker container:
```bash
# Run seed directly in the Docker container
npm run seed:docker
```

## API Documentation

Swagger documentation is available at 
`http://localhost:3000/api`

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  votes     Vote[]
}

model Restaurant {
  id        String   @id @default(uuid())
  name      String
  address   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  foods     Food[]
  votes     Vote[]
}

model Food {
  id           String     @id @default(uuid())
  name         String
  price        Decimal
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  votes        Vote[]
}

model Vote {
  id           String     @id @default(uuid())
  userId       String
  restaurantId String
  foodId       String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  user         User       @relation(fields: [userId], references: [id])
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  food         Food       @relation(fields: [foodId], references: [id])
}

```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@db:5432/voting-app?schema=public"

# Authentication
JWT_SECRET="your-secret-key"

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=voting-app
```

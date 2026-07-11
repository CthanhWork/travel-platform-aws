# Travel Platform Backend

RESTful API backend cho Travel Platform sử dụng Node.js, TypeScript, Express, Prisma và AWS Services.

## Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Cache:** Redis
- **Cloud:** AWS (S3, SES, SQS, SNS, Lambda, etc.)

## Project Structure

```
backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/        # Authentication & User management
│   │   ├── places/      # Places/Listings
│   │   ├── reviews/     # Reviews & Ratings
│   │   ├── trips/       # Trip planner
│   │   └── business/    # Business, Booking, Admin
│   ├── shared/          # Shared utilities
│   ├── core/            # Core configurations
│   │   ├── database/    # DB clients (Prisma, Redis)
│   │   ├── middleware/  # Express middleware
│   │   └── config/      # App & AWS config
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- AWS Account (for S3, SES, SQS, SNS)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Setup database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### Development

```bash
npm run dev
```

Server will start at `http://localhost:3000`

### Build & Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user profile

### Places (`/api/places`)
- `GET /` - Get all places
- `GET /search` - Search places
- `GET /:id` - Get place by ID
- `POST /` - Create place
- `PUT /:id` - Update place
- `DELETE /:id` - Delete place
- `POST /:id/upload-url` - Get S3 presigned URL

### Reviews (`/api/reviews`)
- `GET /place/:placeId` - Get reviews for place
- `POST /` - Create review
- `PUT /:id` - Update review
- `DELETE /:id` - Delete review
- `POST /:id/vote` - Vote review helpful
- `POST /:id/report` - Report review
- `POST /:id/reply` - Reply to review

### Trips (`/api/trips`)
- `GET /saved-places` - Get saved places
- `POST /saved-places` - Save place
- `DELETE /saved-places/:placeId` - Unsave place
- `GET /` - Get all trips
- `GET /:id` - Get trip
- `POST /` - Create trip
- `PUT /:id` - Update trip
- `DELETE /:id` - Delete trip
- `POST /:id/places` - Add place to trip
- `GET /share/:token` - Get public trip

### Business & Admin (`/api/business`)
- `POST /register` - Register as business owner
- `POST /claim/:placeId` - Claim place
- `GET /places` - Get business places
- `GET /reviews` - Get reviews for business
- `GET /analytics` - Get analytics
- `POST /bookings` - Create booking
- `GET /bookings` - Get bookings
- `PUT /bookings/:id/cancel` - Cancel booking
- `GET /admin/*` - Admin endpoints

## AWS Services Integration

- **S3:** Image storage (avatars, places, reviews)
- **CloudFront:** CDN for images
- **SES:** Email notifications
- **SQS:** Message queues (rating calculation, email queue)
- **SNS:** Push notifications
- **Cognito (optional):** User authentication
- **OpenSearch (optional):** Full-text search

## Database Schema

See `prisma/schema.prisma` for full schema.

Main models:
- User
- Place
- Review
- Trip
- Booking
- BusinessClaim
- ChatMessage

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT

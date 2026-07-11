# Travel Platform Frontend

Frontend cho Travel Platform sử dụng Next.js 14, React, TypeScript và TailwindCSS.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Reusable components
│   ├── services/         # API services
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utility functions
├── public/               # Static files
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your API URL
```

### Development

```bash
npm run dev
```

Frontend will start at `http://localhost:3001`

### Build

```bash
npm run build
npm start
```

## Features

- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- API Routes
- Image Optimization
- Responsive Design
- Dark Mode Support

## License

MIT

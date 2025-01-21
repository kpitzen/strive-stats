# Strive Frames

A comprehensive frame data and tier list maker application for Guilty Gear Strive, built with Next.js and Python.

## Project Structure

- `/next/strive-frames` - Next.js frontend application
- `/scraper` - Python scraper for collecting frame data

## Prerequisites

- Node.js (v19.0.0 or higher)
- Python 3.8+
- bun (for package management)

## Getting Started

### Frontend Setup (Next.js)

1. Navigate to the Next.js project:
```bash
cd next/strive-frames
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file with the following template:
```env
# Database Configuration
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Add any additional environment variables here
```

4. Start the development server:
```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

### Scraper Setup

1. Navigate to the scraper directory:
```bash
cd scraper
```

2. Create a Python virtual environment and install dependencies:
```bash
uv sync
```

3. Copy the environment template:
```bash
cp .envrc.template .envrc
```

4. Fill in the required environment variables in `.envrc`

## Available Scripts

### Frontend

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build the production application
- `bun run start` - Start the production server
- `bun run lint` - Run ESLint

### Scraper

- Check the scraper's README.md for available commands and usage

## Contributing

1. Fork the repository
2. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

3. Make your changes and commit them:
```bash
git commit -m "Description of your changes"
```

4. Push to your fork:
```bash
git push origin feature/your-feature-name
```

5. Create a Pull Request

## Project Dependencies

### Frontend Dependencies
- Next.js 15.1.5
- React 19
- React DnD for drag and drop functionality
- Tailwind CSS for styling
- Various Radix UI components
- PostgreSQL database integration

### Development Dependencies
- TypeScript
- ESLint
- Tailwind CSS
- PostCSS

# Next.js Dashboard Template

A modern, responsive dashboard template built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🚀 **Next.js 15** with App Router and Turbopack
- 📝 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🔐 **Authentication System** with JWT token refresh
- 📱 **Responsive Design** with collapsible sidebar
- 🐳 **Docker Ready** with multi-stage build
- ⚡ **Runtime Configuration** for environment variables

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── config/        # Runtime config endpoint
│   ├── login/             # Login page
│   └── page.tsx           # Dashboard home
├── components/
│   ├── layout/            # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── providers/         # Context providers
│       └── AuthProvider.tsx
├── config/
│   └── runtime.ts         # Runtime configuration
├── services/
│   ├── apiClient.ts       # Axios client with interceptors
│   ├── authService.ts     # Authentication service
│   └── index.ts
└── types/
    └── api.ts             # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the template
git clone <repository-url>
cd nextjs-dashboard-template

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Docker Deployment

### Build Docker Image

```bash
chmod +x build.sh
./build.sh
```

### Run with Docker Compose

```bash
# Set API URL (optional)
export NEXT_PUBLIC_API_URL=http://your-api-server:8080/api/v1

# Start container
docker-compose up -d
```

## API Configuration

The template uses runtime configuration to allow changing API URL without rebuilding:

1. **Development**: Uses `.env.local` or defaults to `localhost:8080`
2. **Docker**: Set `NEXT_PUBLIC_API_URL` environment variable in docker-compose.yml

## Authentication Flow

1. User submits login form
2. `authService.login()` sends credentials to `/auth/login`
3. On success, tokens are stored in localStorage
4. `apiClient` automatically adds Bearer token to requests
5. On 401 error, automatic token refresh is attempted
6. On refresh failure, user is redirected to login

## Customization

### Add New Pages

1. Create a new folder in `src/app/`
2. Add `page.tsx` file
3. Add route to `navigation` array in `Sidebar.tsx`

### Add New API Services

1. Create service file in `src/services/`
2. Export from `src/services/index.ts`
3. Add types to `src/types/api.ts`

### Modify Theme

- Edit Tailwind classes in components
- Update gradient colors in `Sidebar.tsx` and `Header.tsx`
- Modify `globals.css` for global styles

## Scripts

```bash
npm run dev      # Development server with Turbopack
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT License

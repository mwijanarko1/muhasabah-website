# Muhasabah — Daily Islamic Accountability Journal

A Next.js 16 web app for recording daily Islamic muhasabah (self-reflection) scores across 7 accountability categories. Built with Firebase Authentication and Firestore for signed-in sync.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Backend**: Next.js API routes with Firebase Admin + Firestore
- **Authentication**: Firebase Authentication with Google sign-in
- **Testing**: Vitest + React Testing Library
- **Development**: Turbopack for fast builds

## Features

- **Daily Journal**: Record muhasabah entries across 7 categories (score range −20 to 100)
- **Google OAuth Sign-In**: Simple one-click authentication
- **Cloud Sync**: Firestore stores signed-in entries across sessions
- **Responsive Design**: Mobile-first Tailwind CSS layout
- **Type-Safe**: Full TypeScript coverage

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (recommended package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mwijanarko1/muhasabah-website.git
   cd muhasabah-website
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the following in `.env.local`:
   - `NEXT_PUBLIC_APP_URL` — your site origin for metadata (local: `http://localhost:3000`)
   - `NEXT_PUBLIC_FIREBASE_*` — Firebase web app config for browser auth
   - `FIREBASE_PROJECT_ID` — Firebase project ID (`muhasabah-c2776`)
   - `FIREBASE_CLIENT_EMAIL` — service account client email for Firebase Admin
   - `FIREBASE_PRIVATE_KEY` — service account private key, with newlines escaped as `\n`
   - Or `FIREBASE_SERVICE_ACCOUNT_JSON` — the full Firebase service account JSON object

   Enable Google as a Firebase Authentication provider and add your app origin to the authorized domains in the Firebase console.

4. **Start the development server**
   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) — you’ll see the landing page; use **Do Muhasabah of today** to open `/today` and run the journal flow.

## Project Structure

```
muhasabah-website/
├── src/
│   ├── app/
│   │   ├── api/muhasabah/    # Firebase-backed journal API routes
│   │   ├── layout.tsx        # Root layout (FirebaseAuthProvider, SEO)
│   │   ├── page.tsx          # Home / landing + routing
│   │   ├── today/page.tsx    # Journal (signed-in or anonymous)
│   │   ├── dashboard/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── components/           # React UI (journal, landing, providers)
│   └── lib/                  # Firebase, scoring, date keys, local draft, env
├── docs/
│   └── CODEBASE_MAP.md       # Architecture inventory and navigation map
├── .env.example              # Environment variable template
├── package.json              # Dependencies and scripts
└── vitest.config.ts          # Test configuration
```

## Documentation

- **[Codebase Map](docs/CODEBASE_MAP.md)** — Full architecture overview, data flows, and module inventory.

## Testing

```bash
bun run test        # Watch mode
bun run test:run    # Single run
```

Tests use Vitest and React Testing Library. Add `*.test.tsx` / `*.test.ts` files alongside your source files.

## Deployment

### Build for Production

```bash
bun run build
```

### Start Production Server

```bash
bun run start
```

Deploy to [Vercel](https://vercel.com), [Netlify](https://netlify.com), or any Next.js-compatible host. Set the same Firebase Admin environment variables listed above in your hosting dashboard.

## Contributing

Feel free to open issues or submit pull requests for improvements and bug fixes.

## License

This project is open source and available under the [MIT License](LICENSE).

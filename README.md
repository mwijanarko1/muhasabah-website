# Muhasabah — Daily Islamic Accountability Journal

A Next.js 16 web app for recording daily Islamic muhasabah (self-reflection) scores across 7 accountability categories. Built with Convex for real-time serverless data and Google OAuth for authentication.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Backend**: Convex (serverless real-time database)
- **Authentication**: `@convex-dev/auth` with Google OAuth
- **Testing**: Vitest + React Testing Library
- **Development**: Turbopack for fast builds

## Features

- **Daily Journal**: Record muhasabah entries across 7 categories (score range −20 to 100)
- **Google OAuth Sign-In**: Simple one-click authentication
- **Real-Time Sync**: Convex keeps entries in sync across sessions
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
   - `NEXT_PUBLIC_CONVEX_URL` — your Convex deployment URL (`.convex.cloud`)
   - `NEXT_PUBLIC_APP_URL` — your site origin for metadata (local: `http://localhost:3000`)
   - `AUTH_SECRET` — a secure random string for session encryption
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth Web client credentials
   - `SITE_URL` — same origin as the app (no trailing slash); required by Convex Auth for OAuth redirects. Also set these auth-related variables on your Convex deployment (Dashboard → Environment Variables), not only in `.env.local`.
   - **`JWT_PRIVATE_KEY` and `JWKS`** — required for Convex Auth session tokens. Generate once per deployment with `bun run generate-convex-auth-keys`, then add both lines to your **Convex** deployment env (not necessarily `.env.local`). Do not rotate keys casually; new keys invalidate existing sessions.

   Create the Google OAuth credentials via the [Google Cloud Console](https://console.cloud.google.com/) and register the Convex HTTP callback URL and JavaScript origins per [Convex Auth](https://labs.convex.dev/auth).

4. **Start Convex dev sync** (in a separate terminal)
   ```bash
   npx convex dev
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) — you’ll see the landing page; use **Do Muhasabah of today** to open `/today` and run the journal flow.

## Project Structure

```
muhasabah-website/
├── convex/                    # Convex backend (serverless functions + schema)
│   ├── auth.ts               # Google OAuth provider
│   ├── helpers.ts            # Shared utility functions
│   ├── http.ts               # Convex HTTP routes (auth add-ons)
│   ├── muhasabah.ts          # Queries for muhasabah entries
│   ├── mutations.ts          # Upsert / write mutations
│   └── schema.ts             # DB schema (userSettings + muhasabahEntries)
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout (ConvexAuthProvider, SEO)
│   │   ├── page.tsx          # Home / landing + routing
│   │   ├── today/page.tsx    # Journal (signed-in or anonymous)
│   │   ├── dashboard/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── components/           # React UI (journal, landing, providers)
│   ├── convex/               # Vitest tests for shared score helpers (not the Convex folder)
│   └── lib/                  # date keys, local draft, env
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

Deploy to [Vercel](https://vercel.com), [Netlify](https://netlify.com), or any Next.js-compatible host. Set the same environment variables listed above in your hosting dashboard. Don't forget to deploy the Convex backend first (`npx convex deploy`) and point `NEXT_PUBLIC_CONVEX_URL` to the production URL.

## Contributing

Feel free to open issues or submit pull requests for improvements and bug fixes.

## License

This project is open source and available under the [MIT License](LICENSE).

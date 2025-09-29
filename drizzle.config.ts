// drizzle.config.ts
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });

export default defineConfig({
  // Include your app schema AND BetterAuth's schema files
  schema: [
    './lib/db/schema.ts',
    './node_modules/@polar-sh/better-auth/drizzle/*.ts',
  ],
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // For migrations, point at the *pooler* URL for stability
    // (Keep DATABASE_URL for runtime; see notes below)
    url: process.env.POSTGRES_URL ?? process.env.DATABASE_URL!,
  },
});

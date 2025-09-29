// lib/auth.ts
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import {
  user, session, verification, account, chat, message,
  extremeSearchUsage, messageUsage, subscription, payment,
  customInstructions, stream, lookout,
} from '@/lib/db/schema';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import { config } from 'dotenv';
import { serverEnv } from '@/env/server';
import { checkout, polar, portal, usage, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';
import { eq } from 'drizzle-orm';
import { invalidateUserCaches } from './performance-cache';
import { clearUserDataCache } from './user-data-server';

config({ path: '.env.local' });

// NOTE: Polar SDK expects an access token; we map POLAR_API_KEY -> POLAR_ACCESS_TOKEN if needed
const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? process.env.POLAR_API_KEY,
  ...(process.env.NODE_ENV === 'production' ? {} : { server: 'sandbox' }),
});

// Utility function to safely parse dates
function safeParseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

export const auth = betterAuth({
  rateLimit: { max: 50, window: 60 },
  cookieCache: { enabled: true, maxAge: 5 * 60 },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user, session, verification, account, chat, message,
      extremeSearchUsage, messageUsage, subscription, payment,
      customInstructions, stream, lookout,
    },
  }),
  socialProviders: {
    github: { clientId: serverEnv.GITHUB_CLIENT_ID, clientSecret: serverEnv.GITHUB_CLIENT_SECRET },
    google: { clientId: serverEnv.GOOGLE_CLIENT_ID, clientSecret: serverEnv.GOOGLE_CLIENT_SECRET },
    twitter:{ clientId: serverEnv.TWITTER_CLIENT_ID, clientSecret: serverEnv.TWITTER_CLIENT_SECRET },
  },
  pluginRoutes: { autoNamespace: true },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      getCustomerCreateParams: async ({ user: newUser }) => {
        try {
          const { result } = await polarClient.customers.list({ email: newUser.email });
          const existing = result.items[0];
          if (existing?.externalId && existing.externalId !== newUser.id && newUser.id) {
            await db.update(user).set({ id: existing.externalId }).where(eq(user.id, newUser.id));
          }
          return {};
        } catch { return {}; }
      },
      use: [
        checkout({
          products: [
            {
              productId: process.env.NEXT_PUBLIC_STARTER_TIER ?? (() => { throw new Error('NEXT_PUBLIC_STARTER_TIER'); })(),
              slug:       process.env.NEXT_PUBLIC_STARTER_SLUG ?? (() => { throw new Error('NEXT_PUBLIC_STARTER_SLUG'); })(),
            },
          ],
          successUrl: `/success`,
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET ?? (() => { throw new Error('POLAR_WEBHOOK_SECRET'); })(),
          onPayload: async ({ data, type }) => {
            if (
              type === 'subscription.created' || type === 'subscription.active' ||
              type === 'subscription.canceled' || type === 'subscription.revoked' ||
              type === 'subscription.uncanceled' || type === 'subscription.updated'
            ) {
              console.log('🎯 Processing subscription webhook:', type);
              console.log('📦 Payload data:', JSON.stringify(data, null, 2));

              try {
                // STEP 1: Extract user ID from customer data
                const userId = data.customer?.externalId;

                // STEP 1.5: Check if user exists to prevent foreign key violations
                let validUserId = null;
                if (userId) {
                  try {
                    const userExists = await db.query.user.findFirst({
                      where: eq(user.id, userId),
                      columns: { id: true },
                    });
                    validUserId = userExists ? userId : null;

                    if (!userExists) {
                      console.warn(
                        `⚠️ User ${userId} not found, creating subscription without user link - will auto-link when user signs up`,
                      );
                    }
                  } catch (error) {
                    console.error('Error checking user existence:', error);
                  }
                } else {
                  console.error('🚨 No external ID found for subscription', {
                    subscriptionId: data.id,
                    customerId: data.customerId,
                  });
                }
                // STEP 2: Build subscription data
                const subscriptionData = {
                  id: data.id,
                  createdAt: new Date(data.createdAt),
                  modifiedAt: safeParseDate(data.modifiedAt),
                  amount: data.amount,
                  currency: data.currency,
                  recurringInterval: data.recurringInterval,
                  status: data.status,
                  currentPeriodStart: safeParseDate(data.currentPeriodStart) || new Date(),
                  currentPeriodEnd: safeParseDate(data.currentPeriodEnd) || new Date(),
                  cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
                  canceledAt: safeParseDate(data.canceledAt),
                  startedAt: safeParseDate(data.startedAt) || new Date(),
                  endsAt: safeParseDate(data.endsAt),
                  endedAt: safeParseDate(data.endedAt),
                  customerId: data.customerId,
                  productId: data.productId,
                  discountId: data.discountId || null,
                  checkoutId: data.checkoutId || '',
                  customerCancellationReason: data.customerCancellationReason || null,
                  customerCancellationComment: data.customerCancellationComment || null,
                  metadata: data.metadata ? JSON.stringify(data.metadata) : null,
                  customFieldData: data.customFieldData ? JSON.stringify(data.customFieldData) : null,
                  userId: validUserId,
                };

                console.log('💾 Final subscription data:', {
                  id: subscriptionData.id,
                  status: subscriptionData.status,
                  userId: subscriptionData.userId,
                  amount: subscriptionData.amount,
                });

                // STEP 3: Use Drizzle's onConflictDoUpdate for proper upsert
                await db
                  .insert(subscription)
                  .values(subscriptionData)
                  .onConflictDoUpdate({
                    target: subscription.id,
                    set: {
                      modifiedAt: subscriptionData.modifiedAt || new Date(),
                      amount: subscriptionData.amount,
                      currency: subscriptionData.currency,
                      recurringInterval: subscriptionData.recurringInterval,
                      status: subscriptionData.status,
                      currentPeriodStart: subscriptionData.currentPeriodStart,
                      currentPeriodEnd: subscriptionData.currentPeriodEnd,
                      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
                      canceledAt: subscriptionData.canceledAt,
                      startedAt: subscriptionData.startedAt,
                      endsAt: subscriptionData.endsAt,
                      endedAt: subscriptionData.endedAt,
                      customerId: subscriptionData.customerId,
                      productId: subscriptionData.productId,
                      discountId: subscriptionData.discountId,
                      checkoutId: subscriptionData.checkoutId,
                      customerCancellationReason: subscriptionData.customerCancellationReason,
                      customerCancellationComment: subscriptionData.customerCancellationComment,
                      metadata: subscriptionData.metadata,
                      customFieldData: subscriptionData.customFieldData,
                      userId: subscriptionData.userId,
                    },
                  });

                console.log('✅ Upserted subscription:', data.id);

                // Invalidate user caches when subscription changes
                if (validUserId) {
                  invalidateUserCaches(validUserId);
                  clearUserDataCache(validUserId);
                  console.log('🗑️ Invalidated caches for user:', validUserId);
                }
              } catch (error) {
                console.error('💥 Error processing subscription webhook:', error);
                // Don't throw - let webhook succeed to avoid retries
              }
            }
          },
        }),
      ],
    }),
    nextCookies(),
  ],
  trustedOrigins: ['http://localhost:3000', 'https://miami.ai', 'https://www.miami.ai', 'https://staging.miami.ai'],
  allowedOrigins:  ['http://localhost:3000', 'https://miami.ai', 'https://www.miami.ai', 'https://staging.miami.ai'],
});
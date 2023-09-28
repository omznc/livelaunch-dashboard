FROM oven/bun:latest AS bun
FROM node:18-alpine AS node

FROM bun AS deps
WORKDIR /app
COPY package.json ./
RUN bun i

FROM node AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1

ENV NEXT_PUBLIC_AXIOM_TOKEN $NEXT_PUBLIC_AXIOM_TOKEN
ENV NEXT_PUBLIC_AXIOM_DATASET $NEXT_PUBLIC_AXIOM_DATASET
ENV NEXT_PUBLIC_DISCORD_CLIENT_ID $NEXT_PUBLIC_DISCORD_CLIENT_ID

RUN npx prisma generate
RUN SKIP_ENV_VALIDATION=1 npm run build

FROM node AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
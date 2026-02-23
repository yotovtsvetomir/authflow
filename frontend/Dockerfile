# -------------------------------
# 1. Base stage
# -------------------------------
FROM node:20-bullseye AS base

WORKDIR /app
COPY package*.json ./

ENV NODE_ENV=development

# Install all dependencies (including dev for local / storybook builds)
RUN npm install --legacy-peer-deps

# Optional: Playwright dependencies
RUN npx playwright install --with-deps

COPY . .

# -------------------------------
# 2. Next.js build stage
# -------------------------------
FROM node:20-bullseye AS next-build

WORKDIR /app
COPY package*.json ./

ENV NODE_ENV=production

# Install all dependencies including dev, because Next.js build needs devDeps
RUN npm install --legacy-peer-deps

COPY . .

# Build Next.js
RUN npm run build

# -------------------------------
# 3. Production stage
# -------------------------------
FROM node:20-alpine AS next-prod

WORKDIR /app

# Copy only the build output and necessary dependencies
COPY --from=next-build /app/package.json ./
COPY --from=next-build /app/package-lock.json ./
COPY --from=next-build /app/.next ./.next
COPY --from=next-build /app/public ./public
COPY --from=next-build /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]

# -------------------------------
# 4. Storybook stage
# -------------------------------
FROM base AS storybook

WORKDIR /app
EXPOSE 6006
CMD ["npm", "run", "storybook"]

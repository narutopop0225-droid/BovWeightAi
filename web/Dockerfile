FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client (we'll add prisma next)
# RUN npx prisma generate

# Build Next.js app
RUN npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]

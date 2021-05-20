FROM node:lts-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:10-alpine AS runner
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 80 
CMD ["npm", "start"]

FROM node:20-alpine AS runtime

WORKDIR /app

# Backup module uses mysqldump; provide it in container runtime.
RUN apk add --no-cache mariadb-client

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["npm", "start"]

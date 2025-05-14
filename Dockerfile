# Étape 1 : Build de l'app
FROM node:18 AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Serveur nginx
FROM nginx:alpine

# Copie le build dans nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie une config nginx personnalisée (optionnel)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
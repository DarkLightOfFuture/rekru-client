FROM node:22.20.0-alpine3.21 AS react

WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build


FROM nginx:alpine

COPY --from=react /app/dist /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
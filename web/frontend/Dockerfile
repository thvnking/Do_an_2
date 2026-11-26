FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.30-alpine AS runtime
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint-cinemind.sh
RUN chmod +x /docker-entrypoint-cinemind.sh
COPY --from=build /app/dist /usr/share/nginx/html
ENV API_HOST=api API_PORT=10000 API_SCHEME=http
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:10000/healthz || exit 1
ENTRYPOINT ["/docker-entrypoint-cinemind.sh"]
CMD ["nginx", "-g", "daemon off;"]

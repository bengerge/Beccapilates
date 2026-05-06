FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

FROM nginx:stable-alpine

COPY --from=build /app/dist /tmp/dist

RUN find /tmp/dist -name "index.html" -exec dirname {} \; | xargs -I % cp -r %/. /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
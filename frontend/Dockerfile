# Dockerfile für das React-Frontend und Nginx
FROM node:16 AS build

# Arbeitsverzeichnis setzen
WORKDIR /app

# Quellcode kopieren
COPY . .
# RUN npx update-browserslist-db@latest
RUN npm install

# Build des React-Frontends
RUN npm run build

# Nginx verwenden, um die statischen Dateien zu dienen
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Create folder for pictures and pdfs
RUN mkdir /usr/share/nginx/html/pdf
RUN chmod -R 755 /usr/share/nginx/html/pdf
RUN mkdir /usr/share/nginx/html/images
RUN chmod -R 755 /usr/share/nginx/html/images

# Exponiere den Port
EXPOSE 80

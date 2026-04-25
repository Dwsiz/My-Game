FROM nginx:1.27-alpine
COPY Flappy_Bird/. /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

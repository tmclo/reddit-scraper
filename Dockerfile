FROM node:17-alpine3.14

RUN apk add bash
RUN mkdir /app

COPY [".env", "credentials.json", "index.js", "package.json", "package-lock.json", "/app/"]

RUN cd /app && npm install && npm run build && mkdir /app/images

CMD [ "/bin/bash", "-c", "cd /app && npm run start && bash" ]
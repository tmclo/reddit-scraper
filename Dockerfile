FROM node:17-alpine3.14

RUN apk add bash
RUN mkdir /app

COPY ["credentials.json", "index.js", "package.json", "package-lock.json", "./"]

RUN cd /app && npm install && npm run build

CMD [ "/bin/bash", "-c", "cd /app && npm run start && bash" ]
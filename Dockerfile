FROM 17-alpine3.14

RUN apk add bash
RUN mkdir /app

COPY ./credentials.json /app
COPY index.js /app
COPY package.json /app
COPY package-lock.json /app

RUN cd /app && npm install

CMD [ "/bin/bash", "-c", "cd /app && npm run start" ]
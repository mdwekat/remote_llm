FROM node:18-alpine

RUN apk update && \
    apk add yarn curl bash && \
    npm i -g npm &&\
    curl -sfL https://gobinaries.com/tj/node-prune | sh -s -- -b /usr/local/bin

WORKDIR /app

COPY package*.json ./

ENV HUSKY=0

RUN npm ci --silent --no-audit

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]

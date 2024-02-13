FROM node:alpine

RUN mkdir -p /usr/src/hints-and-tints-backend

WORKDIR /usr/src/hints-and-tints-backend

COPY package.json /usr/src/hints-and-tints-backend

RUN npm install

COPY . /usr/src/hints-and-tints-backend

RUN npx tsc

EXPOSE 4000

CMD ["node", "./dist/index.js"]
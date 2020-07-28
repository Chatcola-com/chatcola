FROM node:14

WORKDIR /chatcola

COPY package.json yarn.lock ./

RUN yarn install

COPY . .
RUN ls

RUN yarn build



ENV NODE_ENV=${NODE_ENV:-production}

EXPOSE 7777

CMD [ "node", "build/index.js" ]
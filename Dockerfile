FROM node:14

WORKDIR /chatcola

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN chmod +x ./scripts/build
RUN ./scripts/build

RUN npm install -g pm2



ENV NODE_ENV=${NODE_ENV:-production}

EXPOSE 7777

CMD [ "pm2-runtime", "build/index.js" ]
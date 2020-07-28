FROM node:14

WORKDIR /chatcola

COPY package*.json ./

RUN npm install

COPY . .
RUN ls

RUN npm run build



ENV NODE_ENV=${NODE_ENV:-production}

EXPOSE 7777

CMD [ "node", "build/index.js" ]
FROM node:16.17-alpine as base

WORKDIR /app
COPY package*.json ./
COPY . .

FROM base as build

RUN npm i --prefer-offline --no-audit --ignore-scripts
CMD npm run start

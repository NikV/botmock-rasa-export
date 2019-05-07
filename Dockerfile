FROM node:alpine

COPY .env constants/ lib/ package*.json index.js ./

RUN npm install

WORKDIR /output

ENTRYPOINT [ "npm" , "start" ]
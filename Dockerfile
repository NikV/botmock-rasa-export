FROM node:alpine

COPY .env lib/ package*.json index.ts ./

RUN npm install

WORKDIR /output

ENTRYPOINT ["npm" , "start"]

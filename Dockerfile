FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# for production use RUN npm ci --only=production

COPY . .

# run gen_ca.sh

EXPOSE 8000 8080
CMD [ "node", "index.js" ]

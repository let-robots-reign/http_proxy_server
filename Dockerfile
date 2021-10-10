FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN ./gen_ca.sh

COPY ca.crt /usr/local/share/ca-certificates/ca.crt
RUN chmod 644 /usr/local/share/ca-certificates/ca.crt && update-ca-certificates

EXPOSE 8000 8080
CMD [ "node", "index.js" ]

FROM node:boron
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get install -y google-chrome-stable

WORKDIR /usr/src/app
COPY . ./
RUN [ "npm", "install" ]
RUN [ "npm", "run", "build:prod" ]

EXPOSE 4200
CMD [ "npm", "run", "server:dev" ]

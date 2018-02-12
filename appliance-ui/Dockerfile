FROM node:boron

ENV TLS_CERTIFICATE=/certs/server.cert.pem
ENV TLS_PRIVATE_KEY=/certs/server.key.pem

WORKDIR /opt/vmware/vic-ui/vic-appliance-ui
COPY ./vic-appliance-ui/ ./

RUN [ "npm", "install" ]
# TODO: use express.js server and use TLS
EXPOSE 4200
CMD [ "npm", "run", "server:dev" ]

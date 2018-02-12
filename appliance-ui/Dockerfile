FROM node:boron

ENV TLS_CERTIFICATE=/certs/server.cert.pem
ENV TLS_PRIVATE_KEY=/certs/server.key.pem

WORKDIR /opt/vmware/vic-ui/vic-appliance-ui

COPY ./appliance-ui/ ./

# Workaround to an issue where .dockerignore does not ignore node_modules
RUN [ "rm", "-rf", "node_modules"]

# install NPM dependencies
RUN [ "npm", "install" ]

# TODO: use express.js server and use TLS
EXPOSE 4200
CMD [ "npm", "run", "server:dev" ]

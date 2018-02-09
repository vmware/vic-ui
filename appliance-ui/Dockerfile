FROM node:boron

ENV TLS_CERTIFICATE=/certs/server.cert.pem
ENV TLS_PRIVATE_KEY=/certs/server.key.pem

WORKDIR /opt/vmware/vic-ui/vic-appliance-ui
COPY . ./

EXPOSE 4200
CMD [ "npm", "run", "server:dev" ]

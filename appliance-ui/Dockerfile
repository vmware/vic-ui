FROM node:boron

ENV TLS_CERTIFICATE=/certs/server.cert.pem
ENV TLS_PRIVATE_KEY=/certs/server.key.pem
ENV PORT=7080
ENV TLS_PORT=7443

WORKDIR /opt/vmware/vic-ui/vic-appliance-ui

COPY ./appliance-ui/server/ ./

# copy compiled artifacts to the static folder
COPY ./appliance-ui/dist/ ./public/

# install NPM dependencies for Express
RUN [ "npm", "install" ]

EXPOSE ${PORT}
EXPOSE ${TLS_PORT}

CMD [ "./launch_server" ]

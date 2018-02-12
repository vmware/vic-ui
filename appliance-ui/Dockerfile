# usage. docker run -d -p 443:7443 \
#                 -v ${absolute_path_to_certs_folder}:/certs
#                 -v ${absolute_path_to_webserver_logs_folder}:/var/log/vic-appliance-ui
#                 gcr.io/eminent-nation-87317/vic-appliance-ui:dev

FROM node:8

ENV TLS_CERTIFICATE=/certs/server.cert.pem
ENV TLS_PRIVATE_KEY=/certs/server.key.pem
ENV TLS_PORT=7443

WORKDIR /opt/vmware/vic-ui/vic-appliance-ui

# copy express server files
COPY ./appliance-ui/server/ ./

# copy compiled artifacts to the static folder
COPY ./appliance-ui/dist/ ./public/

# install NPM dependencies for Express
RUN [ "npm", "install" ]

# expose TLS port
EXPOSE ${TLS_PORT}

# kick off express server
CMD [ "./launch_server" ]

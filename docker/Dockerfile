FROM node:12

VOLUME ["/src"]

RUN apt-get update && apt-get -y install \
    git \
    make \
    gcc \
    g++

WORKDIR /src
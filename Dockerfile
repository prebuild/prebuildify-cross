ARG TARGET

FROM dockcross/${TARGET}

RUN apt-get -y update && \
  apt-get -y --no-install-recommends install \
    git curl gnupg apt-transport-https \
    && \
  curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
  echo "deb https://deb.nodesource.com/node_10.x buster main" | tee /etc/apt/sources.list.d/nodesource.list && \
  echo "deb-src https://deb.nodesource.com/node_10.x buster main" | tee -a /etc/apt/sources.list.d/nodesource.list && \
  apt-get -y update && \
  apt-get -y install nodejs && \
  rm -rf /var/lib/apt/lists/*

ENV STRIP ${CROSS_ROOT}/bin/${CROSS_TRIPLE}-strip

COPY ./build-in-docker /app/

VOLUME ["/app/input"]

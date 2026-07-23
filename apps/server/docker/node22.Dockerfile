FROM node:22-alpine

RUN apk add --no-cache \
    git \
    bash \
    curl \
    wget \
    ca-certificates \
    openssh-client \
    jq \
    make \
    g++ \
    gcc \
    python3 \
    py3-pip

WORKDIR /workspace

CMD ["sleep", "infinity"]
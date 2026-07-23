FROM alpine:latest

# Minimal universal workspace container (Git + Shell + Utilities)
RUN apk add --no-cache \
    git \
    bash \
    curl \
    wget \
    ca-certificates \
    openssh-client \
    jq

# Set deterministic workspace working directory
WORKDIR /workspace

# Keep container idle until agent prompt execution
CMD ["sleep", "infinity"]

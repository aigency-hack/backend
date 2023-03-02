FROM node:16-alpine

# ENV NODE_OPTIONS=--max_old_space_size=1536 # 75% of total memory
ARG APP_NAME
ENV APP_NAME ${APP_NAME}
ARG APP_ENV
ENV APP_ENV ${APP_ENV}

# Install Tools used
RUN apk add --no-cache git curl
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# Copying this separately prevents re-running npm install on every code change.
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install production dependencies.
RUN pnpm install

# Copy local code to the container image.
COPY . .

# Build the app
RUN pnpm build

# Run the web service on container startup.
CMD pnpm start
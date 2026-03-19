FROM node:22-alpine

RUN apk add --no-cache tini
WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ponder.config.ts ponder.schema.ts ./
COPY abis/ ./abis/
COPY src/ ./src/

EXPOSE 42069

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npx", "ponder", "start"]

FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG SITE_URL=https://www.foropencode.com
ARG ALGOLIA_APP_ID=
ARG ALGOLIA_SEARCH_API_KEY=
ARG ALGOLIA_INDEX_NAME=

ENV SITE_URL=$SITE_URL
ENV ALGOLIA_APP_ID=$ALGOLIA_APP_ID
ENV ALGOLIA_SEARCH_API_KEY=$ALGOLIA_SEARCH_API_KEY
ENV ALGOLIA_INDEX_NAME=$ALGOLIA_INDEX_NAME

RUN pnpm build

FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

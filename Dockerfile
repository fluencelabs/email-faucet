FROM node:16-alpine as builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . ./
RUN npm install --production --silent && npm run build && npm run export

FROM caddy:2.6
WORKDIR /
COPY --from=builder ./app/out /dist
COPY Caddyfile /Caddyfile
ENV PORT=8080
CMD ["caddy", "run", "--config", "/Caddyfile"]

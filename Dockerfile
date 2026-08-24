# Tori is a static SPA (React Router in browser-history mode, all state in
# localStorage) -- there's no API/backend to run. This build produces a
# `dist/` bundle and serves it with nginx, same shape as any static-site
# self-host (Excalidraw's docker image works the same way).

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Installed separately from the source copy so `npm ci` is only re-run when
# package*.json actually changes, not on every source edit.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime stage ----
FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

# Bidpanion production image.
#
# We replace Nixpacks' auto-built image because Nixpacks links Bun and Node
# against OpenSSL 3.3+ from the Nix store, but Prisma's prebuilt query
# engine (linux-arm64-openssl-3.0.x.so.node) needs OpenSSL 3.0.x. The two
# coexist badly: forcing one breaks the other.
#
# Debian Bookworm ships libssl3 = OpenSSL 3.0.x, which matches Prisma's
# binary exactly. The oven/bun:1-debian image gives us Bun on that base,
# no Nix involved.

FROM oven/bun:1-debian
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Cache dependencies separately so source changes don't bust the install layer.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Source.
COPY . .

# Prisma client must be generated before next build (used at type-check time).
RUN bunx prisma generate

ENV NODE_ENV=production
RUN bun run build

EXPOSE 3000

# bun runs the "start" script which migrates the DB and launches next.
CMD ["bun", "run", "start"]

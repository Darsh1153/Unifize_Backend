# Unifize Backend - Run Locally

## Prerequisites

- Node.js 20+
- PostgreSQL running
- npm

## 1) Install dependencies

```bash
npm install
```

## 2) Configure environment

Create/update `.env` in project root:

```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>"
JWT_SECRET="xyz"
PORT=4000
```

## 3) Generate Prisma client

```bash
npm run prisma:generate
```

## 4) Run database migrations

```bash
npm run prisma:migrate -- --name init
```

## 5) Seed sample data

```bash
npm run seed
```

## 6) Start the app (development)

```bash
npm run dev
```

Server runs at:

`http://localhost:4000`

# Unifize_Backend
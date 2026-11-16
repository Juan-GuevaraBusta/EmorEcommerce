# EmorAI Challenge #001 — The Last Item

## Introduction

You run a tiny ticket counter. One product is on sale, and only a few units remain.

Two buyers can hit checkout at the same moment. Both see the last ticket as available. Both complete the purchase. The counter has sold inventory it does not have.

## The Challenge

The API already sells the product and records purchases. Concurrent purchases can leave inventory and purchase records out of agreement.

Read the purchase flow. See what happens when more than one request runs at the same time.

The tests describe the rules the API must keep, including concurrent purchases. Those concurrent cases fail on the starter code.

## Your Mission

1. Understand the existing implementation.
2. Identify the race condition.
3. Implement a concurrency-safe solution.
4. Ensure inventory and purchase records remain consistent.
5. Make all tests pass.

## Requirements

- Never allow negative inventory.
- Never sell more units than are available.
- Ensure only valid purchases are recorded.
- Ensure failed purchases do not modify inventory.
- Preserve existing API contracts.
- All automated tests must pass.

## Getting Started

1. Clone the repository.

```bash
git clone https://github.com/Juan-GuevaraBusta/EmorEcommerce.git
cd EmorEcommerce
```

2. Install dependencies.

```bash
npm install
```

3. Configure environment variables.

```bash
cp .env.example .env
```

4. Start PostgreSQL using Docker Compose.

```bash
docker compose up -d
```

5. Run migrations.

```bash
npx prisma migrate deploy
```

6. Seed the database.

```bash
npx prisma db seed
```

7. Start the API.

```bash
npm run dev
```

8. Run tests.

```bash
npm test
```

The API listens on port `3000` unless `PORT` is set.

## API

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| GET | `/products` | | `200` list of products, including `stock` |
| GET | `/products/:id` | | `200` one product, including `stock` |
| POST | `/products/:id/purchase` | `{ "quantity": 1 }` | `201` purchase |
| GET | `/purchases` | | `200` successful purchases |

`quantity` must be a positive integer.

| Status | When |
| --- | --- |
| `400` | `quantity` is missing, not an integer, or less than 1 |
| `404` | product does not exist |
| `409` | not enough inventory |

## Submission

1. Fork the official repository.
2. Implement your solution in your fork.
3. Run the complete test suite.
4. Push your changes.
5. Open a Pull Request against the original repository.

## What We Evaluate

- Correctness.
- Concurrency handling.
- Transactional consistency.
- Code simplicity.
- Test quality.
- Explanation of technical decisions.

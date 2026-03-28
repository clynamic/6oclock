# 6oclock

![6oclock](packages/web/public/assets/6oclock.svg)

e6 staff dashboard

## Development Setup

### Prerequisites

1. Install [Node.js](https://nodejs.org/en/download/) (20+)
2. Install [Yarn](https://yarnpkg.com/en/docs/install)
3. Install [PostgreSQL](https://www.postgresql.org/download/)

### Getting Started

1. Clone the repository

```bash
git clone https://github.com/clynamic/6oclock.git
```

2. Install dependencies

```bash
yarn
```

3. Set up your database

Create a PostgreSQL database for the project.

4. Set up your environment

Copy `.env.example` to `.env` and fill in the required values.

5. Start the development servers

```bash
yarn api
yarn web
```

## Deployment

For production, we recommend using our Docker setup.

1. Ensure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

2. Set up your environment

Copy `.env.example` to `.env` and fill in the required values.
Database configuration can be removed, as the Docker setup includes a PostgreSQL container.

3. Start the services

```bash
docker compose up -d
```

## Stack

### API (`packages/api`)

- [NestJS](https://nestjs.com/) - backend framework
- [TypeORM](https://typeorm.io/) - database ORM
- [PostgreSQL](https://www.postgresql.org/) - database
- [Jest](https://jestjs.io/) - testing framework

### Web (`packages/web`)

- [Vite](https://vitejs.dev/) - frontend build tool
- [React](https://reactjs.org/) - frontend library
- [Material-UI](https://material-ui.com/) - component library
- [React Query](https://react-query.tanstack.com/) - data fetching
- [React Hook Form](https://react-hook-form.com/) - form handling
- [React Router](https://reactrouter.com/) - routing
- [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout) - dashboard layout

### Shared

- [TypeScript](https://www.typescriptlang.org/) - javascript with types
- [Yarn](https://yarnpkg.com/) - package manager
- [ESLint](https://eslint.org/) - linting
- [Prettier](https://prettier.io/) - code formatting
- [Orval](https://orval.dev/) - API client generator
- [Axios](https://axios-http.com/) - HTTP client
- [date-fns](https://date-fns.org/) - date utility library

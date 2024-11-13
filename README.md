# Pub Crawl Optimizer

A proof of concept for a pub crawl optimizer. The user can input a list of pubs and the app will calculate the shortest path between all of them.

## Features

- Interactive map interface for visualizing routes
- Separate departure and arrival points configuration
- Optimal route calculation between multiple pubs
- Distance and estimated travel time calculation

## Tech stack

- SvelteKit - Full-stack web application framework
- TailwindCSS - Utility-first CSS framework
- Leaflet - Interactive map visualization
- OSRM - High-performance routing engine
- Vroom - Vehicle routing optimization
- SQLite + Drizzle - Lightweight database with type-safe ORM

## Configuration

The app is configured using environment variables. The following variables are available:

### Required Environment Variables

- `ORS_TOKEN`: OpenRouteService API token (Required)
  - Obtain from: [OpenRouteService signup](https://openrouteservice.org/dev/#/signup)
  - Format: String

### Optional Environment Variables

- `DATABASE_URL`: SQLite database URL
  - Default: `:memory:`
  - Example: `file:./database.sqlite`

### Example .env file

```env
DATABASE_URL=file:./database.sqlite
ORS_TOKEN=your_token_here
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or
`pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an
> [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

### Building and running the project

#### Node.js

```bash
npm run build
node build
```

#### Docker

You can use docker to build the project as well. The following command will build the project and run it in a container.

```bash
docker build -t pub-crawl-optimizer .
# Run the container and delete it when it stops
docker run --it -v ./local.db --env-file=.env.local -p 3000:3000 pub-crawl-optimizer
```

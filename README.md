# pub crawl optimizer

A proof of concept for a pub crawl optimizer. The user can input a list of pubs and the app will calculate the shortest path between all of them.

## Features

- map
- Departure and arrival point can be set separately
- Create the most optimal route between all pubs

## Tech stack

- SvelteKit
- TailwindCSS
- Leaflet
- OSRM (routing engine)
- Vroom (routing optimization)
- SQLite + Drizzle

## Configuration

The app is configured using environment variables. The following variables are available:

- `DATABASE_URL`: The URL to the SQLite database. Default: `:memory:`, use `file:./database.sqlite` to store the database in a file.
- `ORS_TOKEN`: A token for the [OpenRouteService API](https://openrouteservice.org/).
-

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

#### NodeJS

```bash
$ npm run build
$ node build
```

#### Docker

You can use docker to build the project as well. The following command will build the project and run it in a container.

```bash
$ docker build -t pub-crawl-optimizer .
# Run the container and delete it when it stops
$ docker run --it -v ./local.db --env-file=.env.local -p 3000:3000 pub-crawl-optimizer
```

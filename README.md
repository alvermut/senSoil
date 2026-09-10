# senStep map demo

A self-contained, map-first product demonstration for step-level soil sensing. It includes a 1.46 km walking survey around Vallon du Stangalar in Brest and a two-year farm survey on a mapped parcel in l’Horta Nord, Valencia. Weather, soil humidity, and conductivity modes share the same step-level map, while the farm timeline includes illustrative NEMESIS-calibrated parameters and a localized out-of-range humidity zone.

## Local development

The project pins Node in `.node-version` and uses npm.

```bash
npm install
npm run dev
```

The maps use embedded OpenStreetMap vector geometry; route geometry, measurement data, font, and icons are bundled locally. The built application makes no runtime requests to map, data, or font services.

## Quality checks

```bash
npm test
npm run build
npm run test:e2e
```

`npm run test:e2e` uses the installed Chrome channel. The Vite preview server is started automatically.

## Cloudflare Workers Static Assets

The repository includes `wrangler.jsonc` with its static asset directory set to `./dist`. Deploy directly after authenticating Wrangler:

```bash
npm run deploy
```

For Git-based Cloudflare Workers Builds deployment, connect the repository with:

- Production branch: `main`
- Root path: `/`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

Vite uses `base: './'`, so the same build works at a hostname root or under a subpath. The demo is deployed as static assets and does not require server-side bindings.

## Data and attribution

The measurement values are deterministic demonstration data. The cartographic linework is a deliberately simplified rendering based on OpenStreetMap geography. Map data © OpenStreetMap contributors, available under the Open Database License.

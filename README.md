# Sensoil map demo

A self-contained, map-first product demonstration for step-level soil sensing. It includes a walking survey through Brest and a two-year farm survey in l’Horta Nord, Valencia.

## Local development

The project pins Node in `.node-version` and uses npm.

```bash
npm install
npm run dev
```

The maps, route geometry, measurement data, font, and icons are bundled locally. The built application makes no runtime requests to map, data, or font services.

## Quality checks

```bash
npm test
npm run build
npm run test:e2e
```

`npm run test:e2e` uses the installed Chrome channel. The Vite preview server is started automatically.

## Cloudflare Pages

The repository includes `wrangler.jsonc` with `pages_build_output_dir` set to `./dist`. Deploy directly after authenticating Wrangler:

```bash
npm run deploy
```

For Git-based Cloudflare Pages deployment, connect the repository with:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`

Vite uses `base: './'`, so the same build works at a hostname root or under a subpath. The demo is public and does not require Cloudflare Access or server-side bindings.

## Data and attribution

The measurement values are deterministic demonstration data. The cartographic linework is a deliberately simplified rendering based on OpenStreetMap geography. Map data © OpenStreetMap contributors, available under the Open Database License.

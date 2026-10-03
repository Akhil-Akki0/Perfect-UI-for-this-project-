# CDF Platform — Final Repaired Build

## Requirements

- Node.js 18 or newer
- npm
- OpenFOAM is optional for local development

## Install and run

```bash
npm install
npm run lint
npm run dev
```

Open http://localhost:3000

## Local OpenFOAM fallback

If OpenFOAM is not installed, the app automatically uses the clearly labelled aerodynamic surrogate solver so the workbench remains usable locally.

To explicitly enable this behavior, add this to `.env`:

```env
OPENFOAM_FALLBACK=true
```

To require native OpenFOAM binaries instead:

```env
OPENFOAM_FALLBACK=false
```

## Production build

```bash
npm run build
npm start
```

## Important

After replacing an older local copy, stop any old server process with `Ctrl+C`, run `npm run dev` again, and refresh Chrome with `Ctrl+Shift+R`.

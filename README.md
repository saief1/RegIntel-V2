# RegIntel Professional

Enterprise Regulatory Intelligence Platform.

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Tech Stack

- React 19 + TypeScript
- Vite

## Documentation

Project documentation lives in [`docs/`](./docs), starting with [`docs/MASTER_SPEC.md`](./docs/MASTER_SPEC.md). Development rules for contributors (human or AI) are defined in [`CLAUDE.md`](./CLAUDE.md).

## Project Structure

```
src/
  components/
    layout/   Application shell (Header, Sidebar, Workspace, AI Panel)
    ui/       Reusable UI primitives (buttons, inputs, avatars, ...)
    icons/    Shared icon set
  styles/     Design tokens
```

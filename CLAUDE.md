# CLAUDE.md

This file defines the development rules that any AI coding agent (or human contributor) must follow when working in the RegIntel codebase.

## Development Rules

1. **Always build production-ready code.** No throwaway scaffolding, no "quick and dirty" implementations — every change should be something that could ship.
2. **Never generate placeholder enterprise features.** Do not invent fake functionality, fake data, or stub business logic to make something "look done." If a feature isn't specified, don't build it.
3. **Use TypeScript.** All application code must be strongly typed. Avoid `any` unless there is no reasonable alternative, and document why when it's used.
4. **Keep components reusable.** Design components to be generic and composable rather than tightly coupled to a single screen or use case.
5. **Prefer composition over duplication.** Reuse and compose existing components/utilities instead of copy-pasting logic.
6. **Never change architecture without approval.** Significant structural changes (new frameworks, data layers, folder structure conventions, etc.) require explicit sign-off before implementation.
7. **Follow Apple, Linear, and Harvey AI design language.** UI decisions should draw on the clarity and restraint of Apple's Human Interface Guidelines, the density and speed of Linear, and the professional, trustworthy tone of Harvey AI. See [`docs/UI_GUIDELINES.md`](./docs/UI_GUIDELINES.md).
8. **Read [`docs/MASTER_SPEC.md`](./docs/MASTER_SPEC.md) before making significant changes.** It is the source of truth for product and technical direction.
9. **Ask before installing new dependencies.** Do not add packages without explicit approval.
10. **Keep code clean, typed, and scalable.** Optimize for long-term maintainability over short-term speed.

## Related Documents

- [`docs/MASTER_SPEC.md`](./docs/MASTER_SPEC.md)
- [`docs/PRODUCT.md`](./docs/PRODUCT.md)
- [`docs/ROADMAP.md`](./docs/ROADMAP.md)
- [`docs/FEATURES.md`](./docs/FEATURES.md)
- [`docs/DATABASE.md`](./docs/DATABASE.md)
- [`docs/API.md`](./docs/API.md)
- [`docs/UI_GUIDELINES.md`](./docs/UI_GUIDELINES.md)
- [`docs/SECURITY.md`](./docs/SECURITY.md)
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- [`docs/DECISIONS.md`](./docs/DECISIONS.md)
- [`docs/CHANGELOG.md`](./docs/CHANGELOG.md)

# Repository Guidelines

## Project Structure & Module Organization

This is a Vue 2 + uni-app WeChat Mini Program. Application code lives in `src/`: pages are under `src/pages/<feature>/index.vue`, shared state in `src/store/`, utilities in `src/utils/`, and assets in `src/static/`. Routing and platform metadata are defined in `src/pages.json` and `src/manifest.json`. Treat `src/uni_modules/` as vendored code; modify it only for intentional module fixes or upgrades.

Backend code lives in `cloudfunctions/`. Deployable functions such as `item/`, `order/`, and `purchase/` have independent packages and entry points. Shared TypeScript contracts are under `cloudfunctions/api/` and `cloudfunctions/types/`. Do not commit `dist/` or `node_modules/`.

## Build, Test, and Development Commands

- `npm install` installs root dependencies from `package-lock.json`.
- `npm run dev:mp-weixin` builds the WeChat target in watch mode to `dist/build/mp-weixin`.
- `npm run build:mp-weixin` creates a production WeChat build.
- `npm run test:mp-weixin` runs Jest for the WeChat platform. Other configured targets include `test:h5`, `test:android`, and `test:ios`.

Import `dist/build/mp-weixin` into WeChat DevTools for interactive testing. Install dependencies separately in a changed cloud-function directory when its lockfile changes.

## Coding Style & Naming Conventions

Follow `.editorconfig`: UTF-8, CRLF, two-space indentation, trimmed trailing whitespace, and a final newline. TypeScript uses strict mode; prefer explicit domain types and the `@/` alias for `src/` imports. Use PascalCase for Vue components, camelCase for variables/functions, and lowercase feature directories. Put reusable request and formatting logic in `src/utils/`.

No formatter or linter is configured, so preserve the surrounding file's quote and semicolon style and keep changes focused.

## Testing Guidelines

Jest 25 is configured, although no tests are committed. Add tests beside the feature or in `__tests__/`, named `*.spec.ts` or `*.spec.js`. Run the platform-specific Jest command and manually verify affected Mini Program pages and cloud-function success/error paths. Cover normal input, validation failures, and inventory/order edge cases.

## Commit & Pull Request Guidelines

History uses short subjects, often with `feat:` and `fix:` prefixes. Prefer `type: concise description` (for example, `fix: refresh order canvas`) and avoid `wip` commits in reviewable branches. Pull requests should summarize changes, list verification commands, link issues, and include screenshots for UI changes. Highlight schema, cloud-function, and configuration changes.

## Security & Configuration

Never commit app secrets, credentials, or production IDs. Keep machine-specific settings in `project.private.config.json`, review `project.config.json` before sharing, and redact sensitive values from documentation and logs.

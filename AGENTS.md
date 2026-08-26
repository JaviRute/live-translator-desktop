# Repository Guidelines

## Project Structure & Module Organization

This repository is currently a blank project scaffold. Keep the root uncluttered. Place production code in `src/`, tests in `tests/` (or beside source files as `*.test.*`), static files in `public/` or `assets/`, and documentation in `docs/`. Group code by feature when practical; for example, keep translation UI, state, and API helpers under `src/features/translation/`.

Do not commit generated output, dependency directories, local caches, or secrets. Add them to `.gitignore` when the relevant tooling is introduced.

## Build, Test, and Development Commands

No build system or package manifest is present yet. When adding one, expose predictable scripts and update this guide. For a JavaScript project, prefer:

- `npm install` — install locked dependencies.
- `npm run dev` — start the local development server.
- `npm test` — run the automated test suite.
- `npm run lint` — check formatting and static-analysis rules.
- `npm run build` — create the production bundle.

Commit the lockfile and ensure commands work from the repository root.

## Coding Style & Naming Conventions

Use the configured formatter and linter. Until configuration exists, use two-space indentation for web files, UTF-8, and a final newline. Prefer `camelCase` for variables and functions, `PascalCase` for components and classes, and `kebab-case` for assets. Keep modules focused and names descriptive.

## Testing Guidelines

Add tests with every behavior change and regression fix. Use names such as `translator.test.ts` or `language-selector.spec.tsx`. Cover successful flows, invalid input, API failures, and accessibility behavior. Document a coverage threshold once a test runner is selected.

## Commit & Pull Request Guidelines

No Git history is available to establish a convention. Use concise, imperative subjects, optionally following Conventional Commits: `feat: add language selector` or `fix: preserve microphone state`. Keep commits focused.

Pull requests should explain the problem and solution, list verification commands, and link issues. Include screenshots for UI changes and call out configuration changes or follow-up work. Request review only after checks pass.

## Security & Configuration

Store local settings in ignored `.env` files and provide safe placeholders in `.env.example`. Validate external input, restrict browser permissions to what the translator needs, and never log audio, transcripts, tokens, or personal data unless explicitly required and protected.

# Contributing to Awaaz

Thanks for helping! All levels are welcome, from fixing one typo to building a large feature.

## Ways to help

- [Report a bug](https://github.com/Coding-Moves/awaaz/issues/new?template=bug_report.yml).
- [Fix the docs](https://github.com/Coding-Moves/awaaz/issues?q=is%3Aopen+label%3Adocumentation).
- Test voices and pronunciation, and report words that sound wrong.
- Test Awaaz on different browsers and phones.
- Try unusual PDF and EPUB files and report extraction problems.
- Write code for a [good first issue](https://github.com/Coding-Moves/awaaz/issues?q=is%3Aopen+label%3A%22good+first+issue%22) or an enhancement.

## Your first contribution

1. Fork the repository.
2. Clone your fork.
3. Run `npm install`.
4. Run `npm run dev`.
5. Create a branch named `feat/...`, `fix/...`, or `docs/...`.
6. Make a focused change.
7. Run `npm run typecheck && npm run lint && npm run build`.
8. Commit with a [Conventional Commit](https://www.conventionalcommits.org/) type: `feat:`, `fix:`, `docs:`, `chore:`, or `refactor:`.
9. Push your branch.
10. Open a pull request.

## For experienced contributors

- The playback engine is in [`lib/player.ts`](./lib/player.ts).
- The worker protocol uses `init`, `generate`, `progress`, `ready`, `audio`, and `gen-error` messages.
- There is no backend because user text should stay on the user's device.
- Cross-origin isolation headers are needed for multi-threaded WASM.
- Vendor files are copied by [`scripts/copy-vendor.mjs`](./scripts/copy-vendor.mjs).

We would especially like help with performance, WebGPU, more languages, accessibility, and offline/PWA support.

## Project rules

- Keep Awaaz free and private. Do not add tracking or upload user text.
- Keep the existing theme.
- Keep pull requests small and focused.
- Link the issue your pull request addresses.
- Add screenshots for UI changes.

## Good first issues

Good first issues are small tasks that help new contributors learn the project. Browse issues labeled [good first issue](https://github.com/Coding-Moves/awaaz/issues?q=is%3Aopen+label%3A%22good+first+issue%22), [help wanted](https://github.com/Coding-Moves/awaaz/issues?q=is%3Aopen+label%3A%22help+wanted%22), [documentation](https://github.com/Coding-Moves/awaaz/issues?q=is%3Aopen+label%3Adocumentation), [bug](https://github.com/Coding-Moves/awaaz/issues?q=is%3Aopen+label%3Abug), [enhancement](https://github.com/Coding-Moves/awaaz/issues?q=is%3Aopen+label%3Aenhancement), and [voices](https://github.com/Coding-Moves/awaaz/issues?q=is%3Aopen+label%3Avoices).

Please also read our [Code of Conduct](./CODE_OF_CONDUCT.md).

## More from Coding Moves

Enjoyed contributing? Coding Moves has more open-source projects that need your help. Visit [github.com/Coding-Moves](https://github.com/Coding-Moves).

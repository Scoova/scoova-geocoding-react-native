# Changelog

All notable changes to `@scoova/geocoding-react-native` are documented
here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.1.1 — 2026-05-25
- Default `baseUrl` switched from the retired `https://geocoding.scoo-va.info` subdomain to the central gateway at `https://api.scoo-va.info/api/v1/geocoding`. Callers who explicitly set `baseUrl` are unaffected. The old subdomain returns `ENDPOINT_RETIRED`.

## [1.1.0] — 2026-05-25

### Added
- `ClientOptions.apiKey` — sent as `X-API-Key` on every request. Falls
  back to `SCOOVA_API_KEY` (if `process` exists in the runtime), then to
  the public `demo` key.
- `ClientOptions.locale` — default locale (e.g. `'fr'`, `'ar-EG'`). Sent
  as `?locale=` + `Accept-Language`. Per-call `lang` overrides. `lang`
  from 1.0.x continues to work as an alias.
- `ClientOptions.androidPackage` / `iosBundleId` — identity headers for
  gateway key-restriction enforcement.
- `batch(queries)` — synchronous POST to `/v1/batch`, up to 100 mixed
  forward (`text`) or reverse (`lat`+`lon`) queries per request.
- Apache-2.0 LICENSE, CHANGELOG.md, .gitignore.

### Changed
- License: `MIT` → `Apache-2.0`.
- `package.json`: added `author`, `repository`, `homepage`, `bugs`,
  `keywords`.

### Compatibility
- 100% wire-compatible with 1.0.x. The constructor still accepts the
  legacy `lang` option; every existing method signature is unchanged.

## [1.0.0] — 2026-05-04

### Added
- Initial RN release. `search`, `autocomplete`, `reverse`, `place`,
  `searchStructured`.

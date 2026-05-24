# @scoova/geocoding-react-native

React Native build of [`@scoova/geocoding`](https://github.com/Scoova/scoova-geocoding-web).
Pure TypeScript, no native modules — uses the global `fetch` shipped with
React Native.

```sh
npm install @scoova/geocoding-react-native
# or: yarn add @scoova/geocoding-react-native
```

```ts
import { GeocodingClient, featureLabel } from '@scoova/geocoding-react-native';

const client = new GeocodingClient({
  apiKey: 'sk_live_…',  // omit → falls back to 'demo' (rate-limited)
  locale: 'fr',
});

const suggestions = await client.autocomplete('Tour Eif', {
  focusPoint: { lat: 48.85, lon: 2.29 },
  size: 5,
});

const reverse = await client.reverse(48.8584, 2.2945, { size: 1 });

const batch = await client.batch([
  { id: 'a', text: 'Times Square' },
  { id: 'b', lat: 40.7484, lon: -73.9857 },
]);
for (const row of batch.results) {
  console.log(row.id, row.top ? featureLabel(row.top) : row.error);
}
```

## Client options

| option           | type     | default                            | notes                                  |
| ---------------- | -------- | ---------------------------------- | -------------------------------------- |
| `apiKey`         | `string` | `SCOOVA_API_KEY` env, then `demo`  | sent as `X-API-Key`                    |
| `baseUrl`        | `string` | `https://geocoding.scoo-va.info`   |                                        |
| `locale`         | `string` | `'en'`                             | `?locale=` + `Accept-Language`         |
| `lang`           | `string` | —                                  | legacy alias for `locale`              |
| `androidPackage` | `string` | —                                  | `X-Android-Package` (key restriction)  |
| `iosBundleId`    | `string` | —                                  | `X-Ios-Bundle-Identifier`              |
| `fetch`          | `fetch`  | RN global                          | for tests / custom transports          |

## API

- `search(text, options)` — `/v1/search`
- `autocomplete(text, options)` — `/v1/autocomplete`
- `reverse(lat, lon, options)` — `/v1/reverse`
- `place(ids)` — `/v1/place`
- `searchStructured(query, options)` — `/v1/search/structured`
- `batch(queries)` — `/v1/batch` (POST, max 100 items)

## Tests

```
npm test
```

## License

Apache-2.0 — see [LICENSE](./LICENSE).

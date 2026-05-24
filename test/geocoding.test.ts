import {
  GeocodingClient,
  GeocodingError,
  featureCoord,
  featureLabel,
  type GeoFeature,
} from '../src/index';

const emptyResp = {
  type: 'FeatureCollection',
  features: [],
  geocoding: { version: '0.2', attribution: '', query: {}, timestamp: 0 },
};

function mockFetch(payload: unknown = emptyResp, status = 200) {
  return jest.fn(async () => new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })) as unknown as typeof fetch;
}

function lastCall(f: typeof fetch) {
  return (f as unknown as jest.Mock).mock.calls[0];
}

describe('GeocodingClient', () => {
  it('builds /v1/search?text=...', async () => {
    const fetchImpl = mockFetch();
    const client = new GeocodingClient({ apiKey: 'k', baseUrl: 'https://example.test', fetch: fetchImpl });
    await client.search('Cairo');
    const url = new URL(lastCall(fetchImpl)[0] as string);
    expect(url.pathname).toBe('/v1/search');
    expect(url.searchParams.get('text')).toBe('Cairo');
  });

  it('forwards focus + boundary + size + lang on search', async () => {
    const fetchImpl = mockFetch();
    const client = new GeocodingClient({ apiKey: 'k', baseUrl: 'https://example.test', fetch: fetchImpl });
    await client.search('coffee', {
      focusPoint: { lat: 30.04, lon: 31.24 },
      boundaryCountry: ['EG', 'AE'],
      layers: ['venue', 'address'],
      size: 5, lang: 'ar-EG',
    });
    const url = new URL(lastCall(fetchImpl)[0] as string);
    expect(url.searchParams.get('focus.point.lat')).toBe('30.04');
    expect(url.searchParams.get('boundary.country')).toBe('EG,AE');
    expect(url.searchParams.get('layers')).toBe('venue,address');
    expect(url.searchParams.get('size')).toBe('5');
    expect(url.searchParams.get('lang')).toBe('ar-EG');
  });

  it('reverse uses point.lat / point.lon', async () => {
    const fetchImpl = mockFetch();
    const client = new GeocodingClient({ apiKey: 'k', baseUrl: 'https://example.test', fetch: fetchImpl });
    await client.reverse(30.04, 31.24);
    const url = new URL(lastCall(fetchImpl)[0] as string);
    expect(url.pathname).toBe('/v1/reverse');
    expect(url.searchParams.get('point.lat')).toBe('30.04');
  });

  it('place joins multiple ids with commas', async () => {
    const fetchImpl = mockFetch();
    const client = new GeocodingClient({ apiKey: 'k', baseUrl: 'https://example.test', fetch: fetchImpl });
    await client.place(['whosonfirst:locality:101751119', 'whosonfirst:country:85632343']);
    const url = new URL(lastCall(fetchImpl)[0] as string);
    expect(url.searchParams.get('ids')).toBe('whosonfirst:locality:101751119,whosonfirst:country:85632343');
  });

  it('searchStructured flattens query fields onto URL', async () => {
    const fetchImpl = mockFetch();
    const client = new GeocodingClient({ apiKey: 'k', baseUrl: 'https://example.test', fetch: fetchImpl });
    await client.searchStructured({ locality: 'Cairo', country: 'EG' }, { size: 3 });
    const url = new URL(lastCall(fetchImpl)[0] as string);
    expect(url.pathname).toBe('/v1/search/structured');
    expect(url.searchParams.get('locality')).toBe('Cairo');
    expect(url.searchParams.get('country')).toBe('EG');
  });

  it('batch POSTs to /v1/batch with items', async () => {
    const fetchImpl = mockFetch({ success: true, data: { count: 2, results: [] } });
    const client = new GeocodingClient({ apiKey: 'k', baseUrl: 'https://example.test', fetch: fetchImpl });
    const res = await client.batch([
      { id: 'a', text: 'Cairo' },
      { id: 'b', lat: 1, lon: 2 },
    ]);
    const [calledUrl, init] = lastCall(fetchImpl);
    const url = new URL(calledUrl as string);
    expect(url.pathname).toBe('/v1/batch');
    expect((init as RequestInit).method).toBe('POST');
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      items: [{ id: 'a', text: 'Cairo' }, { id: 'b', lat: 1, lon: 2 }],
    });
    expect(res.count).toBe(2);
  });

  it('batch rejects empty / oversize input', async () => {
    const client = new GeocodingClient({ apiKey: 'k', baseUrl: 'https://example.test', fetch: mockFetch() });
    await expect(client.batch([])).rejects.toBeInstanceOf(GeocodingError);
    const oversize = Array.from({ length: 101 }, (_, i) => ({ id: String(i), text: 'x' }));
    await expect(client.batch(oversize)).rejects.toBeInstanceOf(GeocodingError);
  });

  it('sends X-API-Key + Accept-Language + ?locale=', async () => {
    const fetchImpl = mockFetch();
    const client = new GeocodingClient({ apiKey: 'sk_live', baseUrl: 'https://example.test', locale: 'fr', fetch: fetchImpl });
    await client.search('Paris');
    const [calledUrl, init] = lastCall(fetchImpl);
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get('X-API-Key')).toBe('sk_live');
    expect(headers.get('Accept-Language')).toBe('fr');
    expect(new URL(calledUrl as string).searchParams.get('locale')).toBe('fr');
  });

  it('wraps non-2xx in GeocodingError', async () => {
    const fetchImpl = jest.fn(async () => new Response('boom', { status: 503 })) as unknown as typeof fetch;
    const client = new GeocodingClient({ apiKey: 'k', baseUrl: 'https://example.test', fetch: fetchImpl });
    await expect(client.search('Cairo')).rejects.toBeInstanceOf(GeocodingError);
  });
});

describe('helpers', () => {
  const f: GeoFeature = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [31.24, 30.04] },
    properties: { name: 'Cairo', label: 'Cairo, Egypt' },
  };
  it('featureCoord returns [lon, lat]', () => expect(featureCoord(f)).toEqual([31.24, 30.04]));
  it('featureLabel prefers label', () => expect(featureLabel(f)).toBe('Cairo, Egypt'));
});

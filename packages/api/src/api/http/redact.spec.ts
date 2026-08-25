import { inspect } from 'util';

import { AXIOS_INSTANCE } from './axios';

const SECRET = 'Basic c2VjcmV0OmtleQ==';

describe('redactErrorInterceptor', () => {
  it('keeps credentials out of a serialised request failure', async () => {
    const error = await AXIOS_INSTANCE.get('http://127.0.0.1:1/posts.json', {
      headers: { Authorization: SECRET },
    }).catch((error: unknown) => error);

    expect(inspect(error, { depth: null })).not.toContain(SECRET);
    expect(JSON.stringify(error)).not.toContain(SECRET);
  });
});

import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { fetchBaseQuery, type BaseQueryFn, type FetchArgs } from '@reduxjs/toolkit/query';

const rawBaseQuery = fetchBaseQuery({ baseUrl: '/api/v1', credentials: 'include' });

const NO_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

let refreshPromise: Promise<boolean> | null = null;

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === 'string' ? args : args.url;
  if (result.error?.status !== 401 || NO_REFRESH_URLS.includes(url)) {
    return result;
  }

  refreshPromise ??= (async () => {
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    );
    return !refreshResult.error;
  })().finally(() => {
    refreshPromise = null;
  });

  const refreshed = await refreshPromise;
  if (refreshed) {
    result = await rawBaseQuery(args, api, extraOptions);
  }
  return result;
};

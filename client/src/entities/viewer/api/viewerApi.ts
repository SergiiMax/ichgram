import { baseApi } from '@/shared/api';
import type { CurrentUser } from '../model/types';

export const viewerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<CurrentUser, void>({
      query: () => '/auth/me',
      transformResponse: (response: { user: CurrentUser }) => response.user,
      providesTags: ['Me'],
    }),
  }),
});

export const { useGetMeQuery } = viewerApi;

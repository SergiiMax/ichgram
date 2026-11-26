export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password/:token',
  explore: '/explore',
  messages: '/messages',
  conversation: '/messages/:conversationId',
  profile: '/profile/:username',
  editProfile: '/accounts/edit',
  post: '/post/:postId',
} as const;

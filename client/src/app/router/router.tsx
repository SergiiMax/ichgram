import { createBrowserRouter } from 'react-router';
import { AuthLayout } from '../layouts/AuthLayout';
import { ROUTES } from '@/shared/config';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { ForgotPasswordPage } from '@/pages/forgot-password';
import { ResetPasswordPage } from '@/pages/reset-password';
import { AppLayout } from '../layouts/AppLayout';
import { HomePage } from '@/pages/homepage';
import { ExplorePage } from '@/pages/explore';
import { MessagesPage } from '@/pages/messages';
import { ProfilePage } from '@/pages/profile';
import { EditProfilePage } from '@/pages/edit-profile';
import { PostPage } from '@/pages/post';
import { NotFoundPage } from '@/pages/not-found';
import { RequireAuth } from './guards/RequireAuth';
import { RedirectIfAuth } from './guards/RedirectIfAuth';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        element: <RedirectIfAuth />,
        children: [
          { path: ROUTES.login, element: <LoginPage /> },
          { path: ROUTES.register, element: <RegisterPage /> },
          { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
        ],
      },
      { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.homepage, element: <HomePage /> },
          { path: ROUTES.explore, element: <ExplorePage /> },
          { path: ROUTES.messages, element: <MessagesPage /> },
          { path: ROUTES.conversation, element: <MessagesPage /> },
          { path: ROUTES.profile, element: <ProfilePage /> },
          { path: ROUTES.editProfile, element: <EditProfilePage /> },
          { path: ROUTES.post, element: <PostPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

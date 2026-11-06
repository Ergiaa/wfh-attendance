import { createBrowserRouter } from 'react-router';

import { GuestOnly, HomeRedirect, RequireAuth, RequireRole } from './auth/guards';
import { AppLayout } from './layouts/AppLayout';
import { HRD_ADMIN } from './lib/roles';
import { CheckInPage } from './pages/CheckInPage';
import { ComingSoon } from './pages/ComingSoon';
import { LoginPage } from './pages/LoginPage';
import { MyAttendancePage } from './pages/MyAttendancePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteErrorPage } from './pages/RouteErrorPage';

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <GuestOnly />,
        children: [{ path: 'login', element: <LoginPage /> }],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <HomeRedirect /> },
              { path: 'check-in', element: <CheckInPage /> },
              { path: 'my-attendance', element: <MyAttendancePage /> },
              {
                path: 'admin',
                element: <RequireRole role={HRD_ADMIN} />,
                children: [
                  { path: 'employees', element: <ComingSoon title="Employees" /> },
                  { path: 'attendance', element: <ComingSoon title="Attendance" /> },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Link, Outlet } from 'react-router';
import { RouterProvider } from 'react-router/dom';

const importError = () =>
  new TypeError('Failed to fetch dynamically imported module');

const router = createBrowserRouter([
  {
    path: '/',
    Component: () => (
      <>
        <nav style={{ display: 'flex', gap: 16 }}>
          <Link to="/">Home</Link>
          <Link to="/object">Object form (bug)</Link>
          <Link to="/function">Function form (works)</Link>
          <Link to="/object-with-loader">Object form + loader (works)</Link>
        </nav>
        <hr />
        <Outlet />
      </>
    ),
    ErrorBoundary: () => <p style={{ color: 'red' }}>Error boundary rendered</p>,
    children: [
      { index: true, Component: () => <p>Pick a link. Each route's import rejects.</p> },
      // Object form, Component only, no loader: navigation commits with an empty outlet.
      { path: 'object', lazy: { Component: () => Promise.reject(importError()) } },
      { path: 'function', lazy: () => Promise.reject(importError()) },
      {
        path: 'object-with-loader',
        loader: () => null,
        lazy: { Component: () => Promise.reject(importError()) },
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} onError={(error) => console.log('onError', error)} />
);

import { act, cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, Link, Outlet } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { afterEach, expect, test } from 'vitest';
afterEach(cleanup);

const importError = () => new TypeError('Failed to fetch dynamically imported module');

function setup(brokenRoute) {
  const router = createMemoryRouter([
    {
      path: '/',
      Component: () => (<><Link to="/broken">Go</Link><p>layout</p><Outlet /></>),
      ErrorBoundary: () => <p>Error boundary rendered</p>,
      children: [{ path: 'broken', ...brokenRoute }],
    },
  ]);
  const onError = [];
  render(<RouterProvider router={router} onError={(e) => onError.push(e)} />);
  return { router, onError };
}

async function go(router) {
  await act(() => router.navigate('/broken'));
}

test('object form, Component only, no loader', async () => {
  const { router, onError } = setup({ lazy: { Component: () => Promise.reject(importError()) } });
  await go(router);
  console.log('[object] pathname:', router.state.location.pathname,
    '| errors:', router.state.errors,
    '| onError calls:', onError.length,
    '| boundary shown:', !!screen.queryByText('Error boundary rendered'),
    '| route Component:', router.routes[0].children[0].Component);
  await act(() => router.navigate('/'));
  await go(router);
  console.log('[object, 2nd visit] errors:', router.state.errors,
    '| boundary shown:', !!screen.queryByText('Error boundary rendered'));
  expect(screen.queryByText('Error boundary rendered')).not.toBeNull();
});

test('function form (control)', async () => {
  const { router, onError } = setup({ lazy: () => Promise.reject(importError()) });
  await go(router);
  console.log('[function] errors:', Object.keys(router.state.errors ?? {}),
    '| onError calls:', onError.length,
    '| boundary shown:', !!screen.queryByText('Error boundary rendered'));
  expect(screen.queryByText('Error boundary rendered')).not.toBeNull();
});

test('object form with a loader (control)', async () => {
  const { router } = setup({ loader: () => null, lazy: { Component: () => Promise.reject(importError()) } });
  await go(router);
  console.log('[object+loader] errors:', Object.keys(router.state.errors ?? {}),
    '| boundary shown:', !!screen.queryByText('Error boundary rendered'));
  expect(screen.queryByText('Error boundary rendered')).not.toBeNull();
});

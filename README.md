# React Router: failed `lazy.Component` import is swallowed

Minimal reproduction for a React Router 8.5.0 (also 7.18.4) data-mode bug: on a route with `lazy: { Component }` and no loader, a rejected `Component` import does not reach the error boundary. The navigation commits, `router.state.errors` stays `null`, `onError` is not called and the outlet renders nothing. Later visits stay blank because the rejected promise is cached.

```sh
npm install
npm test     # the object-form test fails; both controls pass
npm run dev  # click "Object form (bug)": blank outlet, no error boundary
```

- `repro.test.jsx`: Vitest + Testing Library, `createMemoryRouter`
- `src/main.jsx`: the same routes in a browser app with `createBrowserRouter`

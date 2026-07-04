# Build Tool Security

## Current decision

AfricanMovies will retain `react-scripts@5.0.1` for the v1 web release. This is a
temporary build-tool decision, not a claim that the dependency tree has no known
vulnerabilities.

Audit reviewed: July 4, 2026.

The full `npm audit` reported 29 transitive findings: 9 low, 7 moderate, and 13
high. The findings were all reached through the Create React App build and test
toolchain, including Jest, webpack-dev-server, SVGO, Workbox, PostCSS-related
loaders, and serialization utilities. No finding originated from the direct
React, React Router, TanStack Query, HLS, Lucide, or Web Vitals runtime libraries.

NPM's forced remediation proposes replacing `react-scripts` with an invalid or
breaking major result. `npm audit fix --force` is therefore prohibited for this
repository.

## Exposure

Create React App and Testing Library packages execute while developing, testing,
or building the website. They are not Node.js services deployed behind Nginx and
are not installed on the public static web host.

This lowers customer-facing runtime exposure, but it does not eliminate build
machine risk. A vulnerable build tool can still affect a developer workstation or
build runner when it processes malicious or untrusted source, configuration, CSS,
SVG, or dependency input.

## Required controls

1. Build only from an approved, reviewed Git commit.
2. Run builds on a trusted developer machine or controlled build runner.
3. Do not build untrusted pull requests with production credentials available.
4. Keep production secrets out of `REACT_APP_*` variables. Create React App embeds
   those values into the public JavaScript bundle.
5. Run `npm ci`, the complete test suite, and `npm run build` for every release.
   Use npm `10.9.2` whenever the lockfile is regenerated.
6. Inspect dependency and lockfile changes during review.
7. Deploy only the generated `build/` directory to the public web host.
8. Serve the static build through Nginx. Never expose the CRA development server.
9. Run `npm audit --omit=dev` as the browser-runtime dependency gate.
10. Record the full audit separately and review whether any new advisory changes
    the accepted exposure.
11. Do not use `npm audit fix --force`.

## Dependency classification

Browser runtime dependencies remain under `dependencies`:

- React and React DOM.
- React Router.
- TanStack Query.
- HLS.js.
- Lucide React.
- Web Vitals.

Build and test tooling belongs under `devDependencies`:

- `react-scripts`.
- Testing Library packages.
- Jest and jsdom packages inherited through `react-scripts`.

This classification does not erase audit findings. It makes
`npm audit --omit=dev` accurately represent packages required by the browser
application rather than the local compiler and test runner.

## Release commands

```bash
npx --yes npm@10.9.2 ci
CI=true npm test -- --watchAll=false
npm run build
npm audit --omit=dev
```

The production host receives the contents of `build/`; it does not run the build
commands itself.

## Review triggers

Reconsider the CRA decision immediately when any of these occur:

- An advisory affects the generated browser bundle or can be exploited from
  ordinary application input.
- The full audit gains a critical vulnerability.
- A required browser, React, or Node.js upgrade no longer builds reliably.
- The build must process contributions or assets from an untrusted source.
- A CI/CD runner will build pull requests while production credentials are
  available.
- The project begins a major frontend architecture change.

Review this decision at least quarterly even when no trigger occurs. The long-term
remediation remains migration to an actively maintained build tool after the v1
launch is stable.

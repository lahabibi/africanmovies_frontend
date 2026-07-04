# Getting Started with Create React App

## Site modes

AfricanMovies supports three build-time site modes:

- `npm start` or `npm run build` runs the full application.
- `npm run start:coming-soon` previews the pre-launch page.
- `npm run build:coming-soon` creates the pre-launch production build.
- `npm run start:maintenance` previews the maintenance page.
- `npm run build:maintenance` creates the maintenance production build.

The holding pages replace every application route and do not call the backend.

For the production code switch, change `SITE_MODE_SWITCH` in
`src/config/siteMode.js` to `app`, `coming-soon`, or `maintenance`, then run the
normal build and deploy it. The dedicated preview scripts override this switch.

## Production build policy

AfricanMovies currently retains Create React App for the v1 web release. Build
and test packages are development dependencies and must run only on a trusted
developer machine or controlled build runner.

Use npm `10.9.2` when changing dependencies or regenerating `package-lock.json`.
This matches the lockfile behavior used by the AWS Amplify build environment.

Production serves only the generated static `build/` directory through Nginx.
Never run `npm start`, `react-scripts start`, or a Node package installation as
the public web server.

Use `npm audit --omit=dev` to audit browser runtime dependencies separately from
the accepted CRA build-tool findings. Do not run `npm audit fix --force`.

See [Build Tool Security](./docs/build-security.md) for the current risk decision,
controls, and review triggers.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

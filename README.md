# CeniBandham UI

A React application powered by Vite, React-Bootstrap, and Bootstrap, with an
actor registration flow prototype. Registration layouts use Bootstrap's
responsive grid and form components.

The registration flow lives in `src/register.jsx`, and the sign-in page in
`src/Login.jsx`; `src/App.jsx` defines the `/register` and `/login` routes. The
home route (`/`) and unknown routes redirect to `/register`.

## Getting started

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Vite prints the local URL in the terminal. To create a production build, run:

```sh
npm run build
```

## Tests

Run the test suite once:

```sh
npm test
```

Run tests in watch mode while developing:

```sh
npm run test:watch
```

## Registration prototype

The registration flow demonstrates basic account details, mock mobile OTP,
role selection, optional actor profile completion, preview, and safety
reporting. All API methods are collected in `src/clientapi.js`; use `123456` as
the mock OTP. OTP, account creation, role/profile saving, and safety reporting
stay in the browser. Publishing is the exception: it sends a
`POST /profiles/{profileId}/publish` JSON request wrapped as
`{ "payload": { "account": ..., "role": ..., "profile": ..., "media": ... } }`,
with cookie credentials to `VITE_API_BASE_URL` (default
`http://localhost:8080/api`). The profile photo and portfolio
images/videos are included as Base64 data with their filename and MIME type.
The password is deliberately excluded from the publish request.

The publish endpoint and payload are provisional until the backend contract is
available. The account/profile IDs used by the preceding mock steps are
browser-local demo IDs and will need to be replaced with IDs returned by the
backend. Base64 media increases JSON payload size, so the production API should
enforce request-size limits or use a dedicated media-upload endpoint for large
videos. No SMS, persistence, or real authentication is implemented. The
prototype is adult-only and does not request government ID.

## Login prototype

The `/login` page includes username and password fields, a remember-me option,
and links back to registration. Sign-in POSTs
`{ "payload": { "username": "...", "password": "...", "rememberMe": true } }`
to `/auth/login` through `src/clientapi.js`; password recovery posts a payload
containing the username to `/auth/forgot-password`. These provisional
endpoints and payload shapes need to match the backend contract; both requests
use cookie credentials and JSON payloads.

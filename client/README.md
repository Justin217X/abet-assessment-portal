# Frontend Setup

The frontend uses React, TypeScript, Vite, and Tailwind CSS.

Run commands from the `client/` directory unless otherwise specified.

## Prerequisites

- Node.js (a supported LTS version)
- npm

Check your installed versions:

```bash
node --version
npm --version
```

## Install dependencies

From the repository root, navigate to the client directory:

```bash
cd client
```

Install the project dependencies:

```bash
npm ci
```

This installs the dependencies recorded in `package-lock.json`.

## Run the frontend

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, typically:

http://localhost:5173/

Stop the server with Ctrl+C.

## Build the frontend

Run:

```bash
npm run build
```

This performs the configured TypeScript checks and generates a production build in `client/dist/`.

## Preview the build

Run:

```bash
npm run preview
```

Open the URL displayed in the terminal to preview the production build locally.

## Code checks

Run:

```bash
npm run lint
```

This runs the ESLint checks provided by the project.

## Project Structure

- `src/` - React application source code
- `src/App.tsx` - Root application component
- `src/main.tsx` - Application entry point
- `src/index.css` - Tailwind CSS import and global styles
- `public/` - Static assets
- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration

## Current Status

The React, TypeScript, Vite, and Tailwind CSS development environment has been initialized.

The application currently displays a placeholder page. Dashboard functionality, authentication, Canvas integration, and backend API communication have not been implemented.

The temporary HTML dashboard wireframes are stored separately in the repository's `wireframes/` directory.

The frontend and Django backend are currently run independently during development.

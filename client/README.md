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
- `src/main.tsx` - Starts the React application
- `src/App.tsx` - Root application component. Connects the sign-in previews and role demos.
- `src/Button.tsx` - Defines the shared button.
- `src/components/` - Holds shared layout, cards, and tables.
- `src/dashboards/` - Holds the Faculty, Coordinator, Evaluator, and Adminitrator dashboards.
- `src/pages/sign-in/` - Holds the main sign-in screen and two sign-in previews.
- `src/pages/faculty/, src/pages/coordinator/, src/pages/evaluator and src/pages/administrator/` - Hold the pages opened from each dashboard.
- `src/index.css` - Tailwind CSS import and global styles
- `public/` - Static assets
- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration

## Current Status

The frontedn opens with two sign-in previews and four role demos. Each dashboard links to its role-specific pages. Tables and report previews show empty states until backend data is available. 

Authentication, Canvas integration, and Django API connections are planned for later development. See the backend setup guide for Django and PostgreSQL. The original HTML wireframes are kept in wireframes/.

## Team 18: Test UI Locally
From the repository root run:

git fetch origin
git switch feature/faculty-demo-entry
cd client
npm ci
npm run dev

Open the URL shown in the terminal, usually http://localhost:5173/
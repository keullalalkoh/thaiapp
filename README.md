# ThaiSteps
Calm beginner Thai tutor. React + TypeScript + Tailwind + Vite. No backend, no login; progress is stored in localStorage.

## Run
    npm install
    npm run dev      # http://localhost:5173
    npm run build    # type-check + production build

## Audio
Uses the browser's built-in speech synthesis with a th-TH voice (Chrome, Edge, Safari). If no Thai voice is installed, buttons show "Audio unavailable" instead of faking playback. Speaking practice uses browser speech recognition where available (mostly Chrome/Edge); it checks words only, never tones.

## Add content
Edit `src/data.ts`: append lines to a lesson or add a lesson to `RAW`. Format: `thai|romanisation|english|optional example (thai~rom~english)`.
Content has NOT been verified by a native speaker.

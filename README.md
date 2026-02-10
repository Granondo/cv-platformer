# CV Platformer

An interactive resume presented as a 2D platformer game. Control a giraffe character that jumps between platforms — each platform represents a job in my career. Land on a platform to read about the role, tech stack, and achievements.

## Features

- Playable 2D platformer with physics (gravity, jumping, collision)
- Giraffe character with animated scarf and walking legs
- Each platform represents a real job experience
- Side panel displays job details when landing on a platform
- Light / dark theme toggle
- English, Russian and Japanese language support
- Endless fall mode with orbiting tech bubbles when you fall off the edge

## Controls

| Key | Action |
|-----|--------|
| `←` / `A` | Move left |
| `→` / `D` | Move right |
| `Space` | Jump / return to start (when falling) |

## Getting Started

```sh
pnpm install
pnpm dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```sh
pnpm build
pnpm preview
```

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [svelte-i18n](https://github.com/kaisermann/svelte-i18n)
- Canvas API for game rendering
- [Vite](https://vitejs.dev/)

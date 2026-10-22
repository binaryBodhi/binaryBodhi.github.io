# Portfolio

A React and TypeScript portfolio with modern and retro themes, built with Vite.

## Local development

Use Node.js 24 or newer and npm.

```sh
npm ci
npm run dev
```

Vite prints the local address when the development server starts.

## Checks

```sh
npm run lint
npm test
npm run build
```

The build writes the production site to `dist/`. Run `npm run preview` to inspect it.

## Source layout

- `src/data/`: portfolio content and its shared TypeScript contract.
- `src/shared/`: date formatting, contact links, media-query hooks, and animation utilities.
- `src/themes/modern/components/experience/`: experience panels and the scrolling timeline.
- `src/themes/modern/components/canvas/`: drawing functions, palette, and animation lifecycle.
- `src/themes/modern/styles/`: section styles, shared widgets, and responsive rules.
- `src/themes/retro/`: retro presentation and its styles.
- `src/components/theme-transition/`: transition between the two themes.

Edit `src/data/data.ts` to update the content in both themes. Desktop experience
panels share a morph clock; mobile renders the same panel components as a natural list.
Reduced-motion preferences are observed through the shared media-query hooks.

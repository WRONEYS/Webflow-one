# Stillform Assembly

A single-page Home preview. Original copy, Cormorant Garamond and Manrope (SIL Open Font License), and photographs from Pexels. Layout, pacing, and motion are a study of a public reference and are not a reproduction of its assets.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

`npm run build` writes a static site to `dist/`. Any static host can serve that folder. On Vercel, import the repository as a Vite project; the output directory is `dist`.

## Page

Home only, in this order: Hero, Places, Origin pieces, Connection, Updates, People, Admission. The header and menu link to those anchors. The admission form stays in the browser and does not submit anywhere.

## Photographs

Pexels pages used for the pictures in `public/images/`:

- https://www.pexels.com/photo/brutalist-interior-staircase-in-chandigarh-33861679/
- https://www.pexels.com/photo/concrete-building-interior-in-closeup-photo-2081169/
- https://www.pexels.com/photo/close-up-of-marble-sculpture-on-black-background-8593504/
- https://www.pexels.com/photo/323780/
- https://www.pexels.com/photo/1571460/
- https://www.pexels.com/photo/1643383/
- https://www.pexels.com/photo/323705/
- https://www.pexels.com/photo/256150/
- https://www.pexels.com/photo/2462015/
- https://www.pexels.com/photo/1918291/
- https://www.pexels.com/photo/1029604/

## Known differences from the reference study

- The pointer-reactive image treatment is an original relief shader (a soft height bump, slight parallax, and light). It is not a claim to match the reference WebGL effect.
- Reduced motion and coarse pointers use still photographs.
- Mobile Places and the menu were composed from the desktop reference, because those mobile states were not in the supplied screenshots.
- Copy, name, and type are substitutes. Counts and notes are labeled as preview content.

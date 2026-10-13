# FitMatrix design system

Define these tokens before implementing components. The interface is a quiet technical workbench, with honest empty states and visible provenance.

## Palette and hierarchy

- 60% warm canvas: `hsl(42 30% 96%)`; main text `hsl(155 18% 16%)`.
- 30% paper surfaces: `hsl(42 25% 99%)`, muted panels `hsl(42 20% 91%)`; secondary text `hsl(150 8% 36%)`.
- 10% evergreen accent: `hsl(155 32% 27%)`, hover `hsl(155 32% 21%)`, active `hsl(155 32% 17%)`; light text `hsl(42 25% 99%)`.
- Error text: `hsl(8 65% 35%)`; visible focus ring uses evergreen. Text pairings target WCAG AA 4.5:1.

## Typography

Use locally bundled **Space Grotesk** for headings and body, paired with **IBM Plex Mono** for labels, architecture names, and technical status. No external font requests. Heading sizes use fluid scaling; body text is at least 16px.

## Geometry

Spacing scale: 4, 8, 12, 16, 24px, extended by multiples to 32, 48, and 64px. Panel radius 16px; controls 8px; badges pill shaped. Panels use a 1px border and a restrained soft shadow; avoid stacked elevations. Controls have a minimum 44px target.

## Tokens and states

CSS uses primitive palette tokens, semantic surface/text/accent tokens, and button aliases. Buttons have hover, active, focus-visible, disabled, loading, success, and retry/error behavior. API status begins in a loading state and announces results through a polite live region. Empty data displays explanatory copy, never invented model results. Navigation links have hover, active, and focus states; loading/disabled states only apply to operations.

## Responsive and motion

Mobile-first single-column layout becomes a main workspace plus sidebar at 850px. Text wraps and panels shrink without overflow. Transitions last 180ms and affect color/opacity only. Respect reduced-motion preferences. Use semantic landmarks, a skip link, and native buttons/links for keyboard access.

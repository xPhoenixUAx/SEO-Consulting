# Project instructions

## Role

Act as a senior creative developer, motion designer and digital art director.

This project is an interactive digital experience, not a conventional agency
landing page.

## Priority

Visual quality, typography, motion rhythm and emotional impact are as important
as technical correctness.

Do not interpret “creative” as adding more UI elements.

## Required workflow

1. Read brief.md.
2. Inspect every file in references/.
3. Do not immediately build the full website.
4. First create only the opening hero experience.
5. Run it in the browser.
6. Capture and inspect the result at 1440x900 and 390x844.
7. Critically evaluate the visual quality.
8. Fix weak typography, composition and motion.
9. Repeat until the hero meets the acceptance criteria.

## Art direction rules

- The words BE FOUND must be the dominant visual object.
- Typography must remain sharp and legible.
- Use a solid text layer or text mask as the structural foundation.
- Particles may gather around, move across and dissolve the text edges.
- Do not construct the entire headline from sparse particles.
- Preserve substantial negative space.
- Motion must feel organic, slow and cinematic.
- Cursor interaction must be subtle, not game-like.
- The layout must not resemble a dashboard or technical visualization.
- Avoid decorative panels, cards, metrics and interface chrome.

## Implementation direction

Prefer:

- Canvas or WebGL for particles;
- HTML/SVG for sharp typography;
- GSAP and ScrollTrigger for choreography;
- Lenis only if it materially improves scroll behavior;
- deterministic particle targets based on a text mask;
- easing and inertia rather than linear movement.

Do not add a framework unless it improves the implementation.

## Performance

- Target smooth animation on a normal laptop.
- Adapt particle count to viewport size and device capabilities.
- Do not allocate objects inside the main animation loop unnecessarily.
- Pause animations when the page is not visible.
- Provide a reduced-motion version.
- Avoid large libraries without a clear purpose.

## Acceptance criteria

The task is not complete until:

- BE FOUND is readable within one second;
- the animation feels premium rather than like a particle demo;
- particles support the typography instead of destroying it;
- the cursor interaction is noticeable but restrained;
- scrolling creates a coherent transition into a second scene;
- there are no cards, dashboards or boxed compositions;
- desktop and mobile compositions both feel intentionally designed;
- there are no console errors;
- reduced-motion mode works.

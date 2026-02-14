# Slow Flow Trails

A variant of **Flow Field Trails** with slower animation and longer, more persistent trails.

## Concept

- Same flow-field + particle system as Flow Field Trails; mouse still influences the field.
- **Slower:** Lower particle speed and slower flow field evolution so motion feels calmer.
- **Longer trails:** Background fades more slowly so each particle leaves a longer visible trail.
- Color palette is configurable (see sketch source); you can plug in a CSS-derived palette.

## Technical notes

- Particle `maxSpeed` reduced; flow field time scale and force magnitude reduced.
- Background fade alpha lowered for trail persistence.
- Palette is defined at the top of the sketch (replace with your CSS colors when ready).

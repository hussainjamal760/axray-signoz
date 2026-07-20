---
name: Radical Syntax
colors:
  surface: '#131408'
  surface-dim: '#131408'
  surface-bright: '#393a2c'
  surface-container-lowest: '#0e0f05'
  surface-container-low: '#1c1c10'
  surface-container: '#202014'
  surface-container-high: '#2a2b1d'
  surface-container-highest: '#353628'
  on-surface: '#e5e3cf'
  on-surface-variant: '#c8c8ab'
  inverse-surface: '#e5e3cf'
  inverse-on-surface: '#313124'
  outline: '#919378'
  outline-variant: '#474832'
  surface-tint: '#c1d000'
  primary: '#ffffff'
  on-primary: '#2f3300'
  primary-container: '#dcee00'
  on-primary-container: '#616a00'
  inverse-primary: '#5c6300'
  secondary: '#c4ce66'
  on-secondary: '#2f3300'
  secondary-container: '#5e6601'
  on-secondary-container: '#dae479'
  tertiary: '#ffffff'
  on-tertiary: '#1d343a'
  tertiary-container: '#cee7ef'
  on-tertiary-container: '#51686f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dcee00'
  primary-fixed-dim: '#c1d000'
  on-primary-fixed: '#1a1d00'
  on-primary-fixed-variant: '#454b00'
  secondary-fixed: '#e0ea7e'
  secondary-fixed-dim: '#c4ce66'
  on-secondary-fixed: '#1a1d00'
  on-secondary-fixed-variant: '#444b00'
  tertiary-fixed: '#cee7ef'
  tertiary-fixed-dim: '#b2cbd2'
  on-tertiary-fixed: '#061f24'
  on-tertiary-fixed-variant: '#344a51'
  background: '#131408'
  on-background: '#e5e3cf'
  surface-variant: '#353628'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '900'
    lineHeight: 52px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  cta-label:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '800'
    lineHeight: 16px
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
spacing:
  base: 4px
  gutter: 24px
  margin: 32px
  border-width-thick: 3px
  border-width-standard: 2px
---

## Brand & Style
This design system adopts a **Neo-Brutalism** aesthetic, prioritizing raw structural clarity over decorative softness. The target audience includes developers, technical creatives, and power users who value high-density information environments. 

The emotional response is one of confidence, transparency, and intentional "loudness." By stripping away shadows and gradients in favor of thick strokes and high-contrast blocks, the UI feels engineered rather than rendered. The aesthetic balances the precision of developer tools with the expressive energy of modern graphic design, now updated with a high-visibility, "Acid" industrial palette.

## Colors
The palette is rooted in a dark-mode foundation but swaps traditional blues for a high-intensity "Acid Yellow" primary accent. The color strategy relies on semantic derivation to maintain high contrast and functional clarity.

- **Primary:** Acid Yellow (#E5F705) used for high-impact call-to-actions, active structural blocks, and critical focus states.
- **Surface:** Dark, slightly warm charcoal (#141411) provides the base for the industrial, technical look.
- **Accents:** Olive Drab and Sky Tints are used for secondary and tertiary differentiation, ensuring the UI remains legible and categorized.

## Typography
The system utilizes **Geist** for its technical precision, pushing it to its extremes with Black (900) and Extra Bold (800) weights for headlines. This creates a "loud" hierarchy that demands attention.

**JetBrains Mono** is introduced for labels, status indicators, and secondary data to reinforce the technical, brutalist nature of the design. Tight letter-spacing is applied to large headlines to create a compact, heavy-duty visual impact.

## Layout & Spacing
The layout follows a strict **fixed grid** model. Elements are locked into a 12-column system on desktop with generous 24px gutters. Margin consistency is paramount to maintaining the "modular block" feel.

Spacing is calculated in multiples of 4px. Unlike traditional SaaS designs that use soft white space, this system uses "hard edges" where borders define the separation of space rather than distance alone. Containers should sit flush against one another or be separated by clear, consistent intervals that align with the grid.

## Elevation & Depth
Elevation is expressed through **layering and strokes** rather than shadows. 
- **The Flat Stack:** Higher elevation levels are indicated by a 1px inner-border or a hard offset "block shadow" (a solid black or secondary color rectangle shifted 4px down and right) to simulate physical depth.
- **Strokes:** All primary containers must use a 2px or 3px solid border. In dark mode, these borders should be high-contrast (Acid Yellow or off-white) to define the edge clearly against the dark canvas.
- **Surface Contrast:** Use the neutral palette to create "stepped" depth, moving from the darkest surface to lighter container tiers.

## Shapes
The shape language is strictly **Sharp (0px)**. Every container, button, and input field must have 90-degree corners to emphasize the raw, unrefined brutalist influence. For secondary elements like small tags or "sticker" badges, a minimal 2px radius may be used only if 0px interferes with legibility, but 0px remains the global default.

## Components
- **Buttons:** Large, blocky, and high-contrast. Primary buttons use the Acid Yellow background with a 3px black border and Black Extra Bold text. On hover, the button should shift its position (e.g., -2px, -2px) with a hard-color offset shadow appearing underneath.
- **Badges / Stickers:** Designed to look like physical stickers. Use JetBrains Mono text, high-contrast backgrounds (Acid Yellow for info, Sky Tint for secondary stats), and 2px black borders.
- **Cards:** Defined by 2px borders. No soft shadows. Header areas of cards should be separated by a 2px horizontal stroke.
- **Inputs:** High-contrast 2px borders that turn Acid Yellow on focus. Use a thick 3px cursor caret.
- **Checkboxes:** Square, 0px radius, with a thick 2px stroke. When checked, the entire box fills with the primary color and a black "X" or checkmark.
- **Lists:** Separated by 2px horizontal dividers. Each list item should feel like a distinct "rung" on a ladder.
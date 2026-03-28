<script lang="ts">
  // Design Tokens Visual Reference — Aevani Design System
  // Renders all design tokens as visual swatches and samples

  const colors = {
    primary: [
      { name: 'Deep Navy', token: '--color-navy', hex: '#1B2D4A', textColor: '#F7F5F0' },
      { name: 'Warm Cream', token: '--color-cream', hex: '#F7F5F0', textColor: '#1B2D4A', border: true },
    ],
    secondary: [
      { name: 'Muted Blue', token: '--color-blue', hex: '#457B9D', textColor: '#FDFCF9' },
      { name: 'Growth Green', token: '--color-green', hex: '#0A4B3E', textColor: '#F7F5F0' },
    ],
    accent: [
      { name: 'Bold Red', token: '--color-red', hex: '#E63946', textColor: '#FDFCF9' },
    ],
    neutrals: [
      { name: 'Charcoal', token: '--color-charcoal', hex: '#1A1A1A', textColor: '#F7F5F0' },
      { name: 'Warm Gray', token: '--color-warm-gray', hex: '#6B7064', textColor: '#FDFCF9' },
      { name: 'Light Cream', token: '--color-light-cream', hex: '#FDFCF9', textColor: '#1B2D4A', border: true },
      { name: 'Border Light', token: '--color-border', hex: '#E8E5DE', textColor: '#1B2D4A', border: true },
    ],
  };

  const spacingTokens = [
    { name: 'xs', value: '0.25rem', px: '4px' },
    { name: 'sm', value: '0.5rem', px: '8px' },
    { name: 'md', value: '1rem', px: '16px' },
    { name: 'lg', value: '1.5rem', px: '24px' },
    { name: 'xl', value: '2rem', px: '32px' },
    { name: '2xl', value: '3rem', px: '48px' },
    { name: '3xl', value: '4.5rem', px: '72px' },
    { name: '4xl', value: '6rem', px: '96px' },
    { name: '5xl', value: '9rem', px: '144px' },
  ];

  const radiusTokens = [
    { name: 'sm', value: '0.125rem', label: '2px' },
    { name: 'md', value: '0.25rem', label: '4px' },
    { name: 'lg', value: '0.5rem', label: '8px' },
    { name: 'xl', value: '1rem', label: '16px' },
    { name: '2xl', value: '1.5rem', label: '24px' },
    { name: 'full', value: '9999px', label: 'pill' },
  ];

  const shadowTokens = [
    { name: 'sm', value: '0 1px 2px 0 rgba(27,45,74,0.06)' },
    { name: 'md', value: '0 2px 8px 0 rgba(27,45,74,0.10), 0 1px 3px 0 rgba(27,45,74,0.06)' },
    { name: 'lg', value: '0 8px 24px 0 rgba(27,45,74,0.12), 0 2px 6px 0 rgba(27,45,74,0.07)' },
    { name: 'xl', value: '0 20px 48px 0 rgba(27,45,74,0.15), 0 6px 16px 0 rgba(27,45,74,0.08)' },
  ];
</script>

<div style="font-family: Inter, sans-serif; background: #FDFCF9; color: #1B2D4A; padding: 2rem; max-width: 1200px; margin: 0 auto;">

  <!-- Header -->
  <div style="margin-bottom: 3rem; border-bottom: 2px solid #E8E5DE; padding-bottom: 2rem;">
    <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; letter-spacing: 0.08em; color: #6B7064; margin: 0 0 0.5rem;">DESIGN SYSTEM</p>
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 3.5rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 0.5rem;">Aevani Tokens</h1>
    <p style="font-size: 1rem; color: #6B7064; margin: 0;">Visual reference for all design tokens: colors, typography, spacing, shadows, and border radii.</p>
  </div>

  <!-- ==================== COLORS ==================== -->
  <section style="margin-bottom: 3rem;">
    <h2 style="font-family: 'Barlow Condensed', sans-serif; font-size: 1.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 1.5rem; color: #1B2D4A;">Color Palette</h2>

    <!-- Primary -->
    <h3 style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; color: #6B7064; margin: 0 0 0.75rem; text-transform: uppercase;">Primary</h3>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
      {#each colors.primary as color}
        <div style="flex: 1; min-width: 180px;">
          <div
            style="height: 100px; background: {color.hex}; border-radius: 0.5rem; {color.border ? 'border: 1px solid #E8E5DE;' : ''} display: flex; align-items: flex-end; padding: 0.75rem;"
          >
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: {color.textColor}; letter-spacing: 0.05em;">{color.hex}</span>
          </div>
          <p style="margin: 0.5rem 0 0; font-size: 0.875rem; font-weight: 600;">{color.name}</p>
          <p style="margin: 0.2rem 0 0; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #6B7064;">{color.token}</p>
        </div>
      {/each}
    </div>

    <!-- Secondary -->
    <h3 style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; color: #6B7064; margin: 0 0 0.75rem; text-transform: uppercase;">Secondary</h3>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
      {#each colors.secondary as color}
        <div style="flex: 1; min-width: 180px;">
          <div
            style="height: 100px; background: {color.hex}; border-radius: 0.5rem; display: flex; align-items: flex-end; padding: 0.75rem;"
          >
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: {color.textColor}; letter-spacing: 0.05em;">{color.hex}</span>
          </div>
          <p style="margin: 0.5rem 0 0; font-size: 0.875rem; font-weight: 600;">{color.name}</p>
          <p style="margin: 0.2rem 0 0; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #6B7064;">{color.token}</p>
        </div>
      {/each}
    </div>

    <!-- Accent -->
    <h3 style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; color: #6B7064; margin: 0 0 0.75rem; text-transform: uppercase;">Accent</h3>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
      {#each colors.accent as color}
        <div style="flex: 1; min-width: 180px; max-width: 280px;">
          <div
            style="height: 100px; background: {color.hex}; border-radius: 0.5rem; display: flex; align-items: flex-end; padding: 0.75rem;"
          >
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: {color.textColor}; letter-spacing: 0.05em;">{color.hex}</span>
          </div>
          <p style="margin: 0.5rem 0 0; font-size: 0.875rem; font-weight: 600;">{color.name}</p>
          <p style="margin: 0.2rem 0 0; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #6B7064;">{color.token}</p>
        </div>
      {/each}
    </div>

    <!-- Neutrals -->
    <h3 style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; color: #6B7064; margin: 0 0 0.75rem; text-transform: uppercase;">Neutrals</h3>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      {#each colors.neutrals as color}
        <div style="flex: 1; min-width: 160px;">
          <div
            style="height: 80px; background: {color.hex}; border-radius: 0.5rem; {color.border ? 'border: 1px solid #E8E5DE;' : ''} display: flex; align-items: flex-end; padding: 0.75rem;"
          >
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: {color.textColor}; letter-spacing: 0.05em;">{color.hex}</span>
          </div>
          <p style="margin: 0.5rem 0 0; font-size: 0.8rem; font-weight: 600;">{color.name}</p>
          <p style="margin: 0.2rem 0 0; font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: #6B7064;">{color.token}</p>
        </div>
      {/each}
    </div>
  </section>

  <hr style="border: none; border-top: 1px solid #E8E5DE; margin: 2rem 0;" />

  <!-- ==================== TYPOGRAPHY ==================== -->
  <section style="margin-bottom: 3rem;">
    <h2 style="font-family: 'Barlow Condensed', sans-serif; font-size: 1.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 1.5rem; color: #1B2D4A;">Typography</h2>

    <!-- Display -->
    <div style="margin-bottom: 2rem; padding: 1.5rem; background: #F7F5F0; border-radius: 0.5rem;">
      <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; color: #6B7064; margin: 0 0 1rem; text-transform: uppercase;">DISPLAY — Barlow Condensed</p>
      <p style="font-family: 'Barlow Condensed', sans-serif; font-size: clamp(4rem, 8vw, 7rem); font-weight: 900; text-transform: uppercase; letter-spacing: 0.02em; line-height: 0.95; margin: 0; color: #1B2D4A;">GROW DEEPER</p>
      <p style="font-family: 'Barlow Condensed', sans-serif; font-size: clamp(2.25rem, 3.5vw, 3.5rem); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; line-height: 1; margin: 0.5rem 0 0; color: #1B2D4A;">Section Title H1</p>
      <p style="font-family: 'Barlow Condensed', sans-serif; font-size: clamp(1.75rem, 2.2vw, 2.5rem); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.1; margin: 0.5rem 0 0; color: #457B9D;">Card Heading H2</p>
    </div>

    <!-- Body -->
    <div style="margin-bottom: 2rem; padding: 1.5rem; background: #F7F5F0; border-radius: 0.5rem;">
      <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; color: #6B7064; margin: 0 0 1rem; text-transform: uppercase;">BODY — Inter</p>
      <p style="font-size: clamp(1.375rem, 1.6vw, 1.75rem); font-weight: 400; line-height: 1.5; color: #1B2D4A; margin: 0 0 0.75rem;">Lead text — Inter Regular 400. The foundation of sustainable agriculture starts with understanding what grows naturally together in your soil.</p>
      <p style="font-size: clamp(1rem, 1vw, 1.125rem); font-weight: 400; line-height: 1.6; color: #1B2D4A; margin: 0 0 0.75rem;">Body text — Inter Regular 400. Polyculture farming mimics natural ecosystems, creating resilient, productive landscapes that regenerate rather than deplete.</p>
      <p style="font-size: clamp(0.8rem, 0.8vw, 0.875rem); font-weight: 600; line-height: 1.4; color: #6B7064; margin: 0;">UI Label — Inter SemiBold 600. Add to cart</p>
    </div>

    <!-- Mono -->
    <div style="padding: 1.5rem; background: #F7F5F0; border-radius: 0.5rem;">
      <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; color: #6B7064; margin: 0 0 1rem; text-transform: uppercase;">MONO — JetBrains Mono</p>
      <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; letter-spacing: 0.12em; color: #0A4B3E; margin: 0 0 0.5rem; text-transform: uppercase;">HEIRLOOM TOMATOES / CATEGORY LABEL</p>
      <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #6B7064; margin: 0 0 0.5rem; letter-spacing: 0.05em;">SKU-2024-HT-001 · Added 2026-03-27</p>
      <p style="font-family: 'JetBrains Mono', monospace; font-size: clamp(1.375rem, 1.6vw, 1.75rem); font-weight: 700; color: #1B2D4A; margin: 0;">1,247 growers</p>
    </div>
  </section>

  <hr style="border: none; border-top: 1px solid #E8E5DE; margin: 2rem 0;" />

  <!-- ==================== SPACING ==================== -->
  <section style="margin-bottom: 3rem;">
    <h2 style="font-family: 'Barlow Condensed', sans-serif; font-size: 1.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 1.5rem; color: #1B2D4A;">Spacing Scale</h2>
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      {#each spacingTokens as token}
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #6B7064; width: 4rem; flex-shrink: 0;">--space-{token.name}</span>
          <div style="height: 1.5rem; background: #0A4B3E; border-radius: 2px; width: {token.value}; min-width: 4px; flex-shrink: 0;"></div>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #6B7064;">{token.value} ({token.px})</span>
        </div>
      {/each}
    </div>
  </section>

  <hr style="border: none; border-top: 1px solid #E8E5DE; margin: 2rem 0;" />

  <!-- ==================== BORDER RADIUS ==================== -->
  <section style="margin-bottom: 3rem;">
    <h2 style="font-family: 'Barlow Condensed', sans-serif; font-size: 1.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 1.5rem; color: #1B2D4A;">Border Radius</h2>
    <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-end;">
      {#each radiusTokens as token}
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 64px; height: 64px; background: #1B2D4A; border-radius: {token.value};"></div>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #6B7064;">--radius-{token.name}</span>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: #6B7064;">{token.label}</span>
        </div>
      {/each}
    </div>
  </section>

  <hr style="border: none; border-top: 1px solid #E8E5DE; margin: 2rem 0;" />

  <!-- ==================== SHADOWS ==================== -->
  <section style="margin-bottom: 3rem;">
    <h2 style="font-family: 'Barlow Condensed', sans-serif; font-size: 1.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 1.5rem; color: #1B2D4A;">Shadows</h2>
    <div style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-end;">
      {#each shadowTokens as token}
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          <div style="width: 100px; height: 70px; background: #F7F5F0; border-radius: 0.5rem; box-shadow: {token.value};"></div>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #6B7064;">--shadow-{token.name}</span>
        </div>
      {/each}
    </div>
  </section>

  <hr style="border: none; border-top: 1px solid #E8E5DE; margin: 2rem 0;" />

  <!-- ==================== SEMANTIC USAGE ==================== -->
  <section>
    <h2 style="font-family: 'Barlow Condensed', sans-serif; font-size: 1.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 1.5rem; color: #1B2D4A;">Semantic Color Usage</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
      <div style="padding: 1.25rem; background: #1B2D4A; border-radius: 0.5rem; color: #F7F5F0;">
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; margin: 0 0 0.5rem; opacity: 0.6;">BASE-CONTENT</p>
        <p style="font-size: 0.875rem; font-weight: 600; margin: 0;">Primary Text</p>
      </div>
      <div style="padding: 1.25rem; background: #E63946; border-radius: 0.5rem; color: #FDFCF9;">
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; margin: 0 0 0.5rem; opacity: 0.8;">ERROR / CTA</p>
        <p style="font-size: 0.875rem; font-weight: 600; margin: 0;">Add to Cart</p>
      </div>
      <div style="padding: 1.25rem; background: #0A4B3E; border-radius: 0.5rem; color: #F7F5F0;">
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; margin: 0 0 0.5rem; opacity: 0.7;">ACCENT / SUCCESS</p>
        <p style="font-size: 0.875rem; font-weight: 600; margin: 0;">Certified Organic</p>
      </div>
      <div style="padding: 1.25rem; background: #457B9D; border-radius: 0.5rem; color: #FDFCF9;">
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; margin: 0 0 0.5rem; opacity: 0.8;">SECONDARY / INFO</p>
        <p style="font-size: 0.875rem; font-weight: 600; margin: 0;">Learn More</p>
      </div>
    </div>
  </section>

</div>

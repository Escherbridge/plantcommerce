# Aevani — Product Guidelines

## Brand Voice & Tone

- **Warm & knowledgeable** — Approachable expertise; never condescending, always helpful
- **Eco-conscious** — Sustainability is core, not an afterthought; weave it naturally into messaging
- **Empowering** — Focus on what users *can* do, not what they should avoid
- **Community-oriented** — "We" language; the platform serves a shared mission

### Writing Principles
- Lead with benefits, not features
- Use plain language; explain technical terms when necessary
- Keep sentences short and scannable
- Use active voice

## Design Standards

### Visual Direction
- **Minimalist & clean** — Generous whitespace, simple layouts, products take center stage
- **Nature-inspired palette** — Greens, earth tones, with clean whites and soft neutrals
- **Mobile-first** — All layouts designed for mobile, enhanced for desktop

### UI Principles
- **Clarity over decoration** — Every element should serve a purpose
- **Consistent spacing** — Use Tailwind's spacing scale consistently (4, 8, 16, 24, 32, 48px)
- **Typography hierarchy** — Clear heading levels, readable body text (16px minimum)
- **Accessible** — WCAG 2.1 AA compliance; sufficient contrast, keyboard navigation, screen reader support

### Component Standards
- Use DaisyUI components as the foundation
- Extend with Tailwind utilities; avoid custom CSS unless necessary
- Components should be self-contained and reusable
- Follow existing component patterns in `src/lib/components/`

## Communication Style

### Error Messages
- Be specific about what went wrong
- Suggest a clear next action
- Never blame the user

### Empty States
- Explain what will appear and how to get started
- Include a clear call-to-action

### Loading States
- Use skeleton screens over spinners where possible
- Provide feedback within 100ms of user action

# Conductor Workflow: Aevani

## Development Methodology

### TDD Cycle (Red-Green-Refactor)

Every task follows this cycle:

1. **Red**: Write a failing test that defines the expected behavior
2. **Green**: Write the minimum code to make the test pass
3. **Refactor**: Clean up the implementation while keeping tests green

### Coverage Target: 70%

- Focus coverage on critical paths: auth flows, tRPC procedures, cart/checkout logic
- Unit tests (Vitest) for business logic, services, and utilities
- Integration tests for tRPC routers and database operations
- Component tests for key UI interactions

## Track Structure

### Creating a Track

Each feature/enhancement gets a track with:
```
conductor/tracks/<track_id>/
  spec.md        # What to build (requirements, acceptance criteria)
  plan.md        # How to build it (phased tasks with TDD structure)
  metadata.json  # Track metadata (status, dates)
```

Track ID format: `<shortname>_YYYYMMDD`

### Plan Structure

Plans are organized into phases, each containing ordered tasks:

```markdown
## Phase 1: <Phase Name>

### Task 1.1: <Task Name>
- [ ] Write test: <test description>
- [ ] Implement: <implementation description>
- [ ] Verify: tests pass, no regressions
```

## Commit Strategy

### Frequency: Manual

Commits are created only when explicitly requested. This gives full control over commit timing and grouping.

### Commit Message Format

```
conductor(<track>): <description>

Phase: <phase number>
Tasks completed: <list>
```

### Git Notes

After significant milestones, attach metadata via git notes:

```bash
git notes add -m "track: <track_id>, phase: <N>, status: complete"
```

## Quality Gates

### Before Marking a Phase Complete

1. All phase tasks have passing tests
2. No TypeScript errors (`svelte-check` passes)
3. Formatting passes (`prettier --check .`)
4. Coverage meets 70% threshold for changed code
5. No security regressions

### Before Marking a Track Complete

1. All phases complete
2. Full test suite passes
3. Acceptance criteria from spec.md verified

## Commands

| Action | Command | Working Directory |
|:---|:---|:---|
| Dev server | `npm run dev` | `plantapp/` |
| Build | `npm run build` | `plantapp/` |
| Type check | `npm run check` | `plantapp/` |
| Format | `npm run format` | `plantapp/` |
| Lint | `npm run lint` | `plantapp/` |
| DB push | `npm run db:push` | `plantapp/` |
| DB generate | `npm run db:generate` | `plantapp/` |
| DB migrate | `npm run db:migrate` | `plantapp/` |
| DB studio | `npm run db:studio` | `plantapp/` |
| Storybook | `npm run storybook` | `plantapp/` |

# QueryMatrix — Visual Query Engineering Platform

## Live Demo
[View QueryMatrix Live](https://query-matrix.vercel.app/)

The included `vercel.json` configures `npm run build`, `.next`, Next.js framework detection, production on main, and preview deployments for pull requests.

## Architecture Explanation
QueryMatrix uses one recursive `QueryNode` model as the source of truth. A `GroupNode` owns child `QueryNode[]`, so the same tree powers form rendering, graph rendering, generators, validation, simulator execution, history, presets, export, and import.

Component tree:
`app/page.tsx → Header + ResizablePanel → QueryBuilder + HistoryTimeline → QueryPreview + QuerySimulator + Sidebar`.

Data flow:
`Zustand stores → recursive components → generators → simulator → history/node match state`.

## Recursive Rendering Strategy
`ConditionGroup` renders a group header, DnD sortable child list, conflict warnings, and add controls. When a child is another group, `ConditionGroup` calls itself with `depth + 1`.

Depth controls the visual border cascade from blue to violet, amber, pink, and red. `React.memo` isolates nested groups so local edits avoid unnecessary sibling work.

## State Management Decisions
Zustand keeps global state small and explicit. `queryStore` is wrapped in zundo temporal middleware with a 50-snapshot limit for undo/redo.

All query mutations call immutable functions in `treeUtils`; components never mutate tree objects directly. Settings and presets persist to local storage.

## Query Engine Design
Operators are constrained by field type through `OPERATORS_BY_TYPE`, preventing invalid combinations in the UI and validator.

Generators convert the same tree into SQL, MongoDB, Prisma, and REST params. The simulator evaluates the tree against deterministic 100-row mock datasets.

Conflict detection catches impossible ranges, incompatible operators, missing values, empty nested groups, and duplicate equality constraints inside AND groups.

## Performance Optimization Techniques
`ConditionGroup` is memoized, node IDs are stable via nanoid, generator/validation/computation outputs are memoized where used, and mock datasets are capped at 100 rows per schema.

ReactFlow graph data is derived from the tree and uses dagre layout only when tree/schema changes.

## AI Integration
`NaturalLanguageBar` accepts plain English, builds the required structured prompt, and calls `/api/ai-query`.

When `OPENAI_API_KEY` is configured, the route calls an OpenAI-compatible chat endpoint. Without a key, a deterministic fallback parser handles common demo phrases so the submission remains reviewable.

Failures show a retryable toast. Successful generations import the returned `QueryTree` and show “Query generated! Review and run.”

## Trade-offs Made
The project is fully buildable locally, deployed to Vercel, and backed by the required seven-PR workflow. The AI integration remains optional: without `OPENAI_API_KEY`, the deterministic fallback parser keeps the submission reviewable.

The local shadcn-compatible primitives use Radix directly rather than relying on generated shadcn files, keeping the codebase explicit while satisfying the specified component families.

## Setup Instructions
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Optional AI environment:
```bash
OPENAI_API_KEY=your_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

## How to Run Tests
```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Current verification: TypeScript passes, ESLint has no warnings/errors, 76 Vitest tests pass, and production build succeeds.

## Git Workflow (PR history summary)
PR 1: [`feat/project-scaffold`](https://github.com/Collinsthegreat/Query_Matrix/pull/1) — Next.js, TypeScript, Tailwind, shadcn-compatible primitives, Zustand, types, constants, treeUtils, unit tests.

PR 2: [`feat/recursive-query-builder`](https://github.com/Collinsthegreat/Query_Matrix/pull/2) — recursive `ConditionGroup`, `RuleRow`, selectors, dynamic inputs, logic toggle, DnD Kit.

PR 3: [`feat/query-generators-and-preview`](https://github.com/Collinsthegreat/Query_Matrix/pull/3) — SQL, MongoDB, Prisma, REST generators and Monaco preview tabs.

PR 4: [`feat/query-simulator`](https://github.com/Collinsthegreat/Query_Matrix/pull/4) — deterministic datasets, executor, results table, sorting, pagination, CSV export.

PR 5: [`feat/ai-natural-language-and-validation`](https://github.com/Collinsthegreat/Query_Matrix/pull/5) — AI bar, API route, fallback parser, validators, conflict warnings, complexity badge.

PR 6: [`feat/advanced-interactions`](https://github.com/Collinsthegreat/Query_Matrix/pull/6) — command palette, keyboard shortcuts, timeline, schema switcher, ReactFlow graph, presets/history.

PR 7: [`feat/polish-and-accessibility`](https://github.com/Collinsthegreat/Query_Matrix/pull/7) — theme persistence, responsive layout, mobile tabs, reduced motion, focus management, integration tests, README, Vercel config.

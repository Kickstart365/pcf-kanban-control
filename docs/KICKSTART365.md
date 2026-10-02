# Kickstart365 fork: initial baseline and lifecycle fix

## Source and scope

- Fork: https://github.com/Kickstart365/pcf-kanban-control
- Upstream: https://github.com/novalogica/pcf-kanban-control
- Both `main` branches were checked on 2026-10-02 and pointed to
  `e21c83ecb6151a160d8fbdb898f50f9912c2397e`.
- Both had tree `83010495f25740af1b18ba1178f1a2d68b995cc5`.
- The GitHub fork relationship is intact. The upstream MIT license and
  attribution remain in place.

This first change fixes removal of the virtual React control and adds CI.
The control stays generic; customer sales rules belong in customer-owned
configuration and server-side validation.

## Confirmed lifecycle defect

The original entry point declared `private control` but never assigned it.
`destroy()` called `this.control.destroy()`, which throws a TypeError when
the PCF host removes the control. The unused property and empty constructor
have been removed. `destroy()` has no cleanup to perform because this entry
point does not own a separately mounted React tree or other resources.

The regression tests execute the actual TypeScript entry point with the App
and React rendering boundary stubbed. All three tests fail on the original
source and pass after the fix: removal before initialization, after
initialization, and after `updateView` (including repeated cleanup). They
also check that resize tracking and the App context/notification properties
are still forwarded. They do not verify the rendered board or Dataverse.

Microsoft references:

- https://learn.microsoft.com/en-us/power-apps/developer/component-framework/reference/react-control/destroy
- https://learn.microsoft.com/en-us/power-apps/developer/component-framework/react-controls-platform-libraries

## Reproduce locally

Use Node.js 22 and the committed npm lockfile:

```bash
git clone https://github.com/Kickstart365/pcf-kanban-control.git
cd pcf-kanban-control
git remote add upstream https://github.com/novalogica/pcf-kanban-control.git
git switch fix/react-control-destroy
npm ci --no-audit --no-fund
node --test tests/kanban-lifecycle.test.cjs
npm run lint
npm run build -- --buildMode production
```

To reproduce the untouched baseline, use a separate checkout at the exact
upstream commit above and run `npm ci` and the same production build.

## CI and evidence

`PCF CI` runs for pull requests to `main`, pushes to `main`, and manual runs.
It installs locked dependencies, runs the lifecycle tests, lints, and builds
the production control. The compiled `out/controls/` directory is uploaded
as an artifact associated with the checked commit. Actions use pinned commit
SHAs and the workflow has read-only repository permissions.

The initial `fix/react-control-destroy` PR also runs an informational build
of the exact original upstream commit. An original-build failure remains
visible in its job log; it does not waive validation of the proposed code.

Local dependency downloads were unavailable in the authoring environment.
The regression test was run with an already available TypeScript compiler;
the locked dependencies and complete build must be verified by CI. A green
compile is not proof of runtime behavior in a model-driven app.

## Before an InSpark DEV pilot

1. Check the CI result and retain the build evidence for the reviewed commit.
2. Decide the fork's permanent PCF namespace and solution publisher before
   packaging. A namespace change creates a different component identity;
   it is not a cosmetic rename. This first patch keeps the upstream identity
   and manifest version; an installable fork release needs its own version.
3. Review platform-library compatibility and dependency support before the
   first release. This patch does not upgrade the upstream dependency set.
4. Build a Dataverse solution around the reviewed control using Power
   Platform CLI/MSBuild. The CI artifact is a compiled control, not an
   importable managed or unmanaged solution ZIP.
5. Test an Opportunity view grouped by a simple Choice column. Include
   `sparked_estimatedweightedrevenue` if available in the customer schema.
6. Check an empty view, lookup columns, text filters, refresh/navigation,
   denied updates, and representative data volumes. Enforce critical move
   rules server-side as well as any optional client-side validation hook.
7. Exercise any BPF configuration separately, including branches, before
   making stage moves part of the pilot.

This change does not install or deploy anything to Dataverse.

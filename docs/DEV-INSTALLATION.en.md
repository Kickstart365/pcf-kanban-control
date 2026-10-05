# Kickstart365 Kanban 1.10.0: download, install and build

**Language: English | [Nederlands](DEV-INSTALLATION.md)**

All settings and examples are in the
[complete configuration guide](CONFIGURATION.en.md). Technical details and
pilot checks for side panes, colors and editing are in
[Interaction settings](INTERACTION-SETTINGS.md).

## Download the solutions

Download the verified **1.10.0.0** version directly:

| Package | Download | Use |
| --- | --- | --- |
| Managed | [Kickstart365Kanban_1_10_0_0_managed.zip](https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/downloads/1.10.0.0/Kickstart365Kanban_1_10_0_0_managed.zip) | Installing or updating a managed installation. |
| Unmanaged | [Kickstart365Kanban_1_10_0_0_unmanaged.zip](https://raw.githubusercontent.com/Kickstart365/pcf-kanban-control/main/downloads/1.10.0.0/Kickstart365Kanban_1_10_0_0_unmanaged.zip) | Development/customization or updating an unmanaged installation. |

Each link downloads a **directly importable solution ZIP**. Do not extract
these ZIPs. See [checksums and build source](../downloads/1.10.0.0/README.md).

The packages come from [the successful PR build](https://github.com/Kickstart365/pcf-kanban-control/actions/runs/37289034913)
for commit `341780630a99bcc51770825b5205522da5a952b6`. The source and version
are recorded in the download directory. For future builds, also use
[Dataverse solution build](https://github.com/Kickstart365/pcf-kanban-control/actions/workflows/solution-build.yml):
open a successful run on `main` and download the `Kickstart365Kanban-…`
package under **Artifacts**. Extract **that outer Actions archive**, then
import only the desired inner managed/unmanaged solution ZIP.

## Install, upgrade and configure

1. Select the intended environment at https://make.powerapps.com and import
   the chosen ZIP through **Solutions → Import**.
2. If `Kickstart365Kanban` is already installed, keep the same package type:
   managed for managed, unmanaged for unmanaged. Keep the same solution
   identity and import the newer version. Do not remove the control to
   upgrade. The identity is unchanged from 1.8.
3. Add **Kickstart365 Kanban** in the Opportunity view and follow
   [the quick start](OPPORTUNITY-CONFIGURATION.en.md) or
   [the complete setup](CONFIGURATION.en.md#set-up-in-power-apps).
4. Save/publish the view/app. Select the view in the app and, where needed,
   **Show as → Kickstart365 Kanban**; Microsoft Kanban is a separate control.
   Run the checks in the quick start, plus
   [the technical checks](OPPORTUNITY-FOUNDATION.md).

The package contains only the control. It creates no Opportunity view, BPF,
customer fields or model-driven app. A successful build does not demonstrate
an import/runtime test in the intended InSpark Dataverse environment.

## Identity

- Control namespace: `kickstart365`; constructor: `KanbanViewControl`.
- Control version: `1.10.0`; display name: **Kickstart365 Kanban**.
- Solution: `Kickstart365Kanban`, version `1.10.0.0`.
- Publisher: `kickstart365`; customization prefix: `k365`.

This identity is separate from the original `novalogica` control, so both
can be tested side by side. Views using the original control must explicitly
be configured to use the new one. Retain the original MIT license and
attribution when redistributing the fork.

## Build it yourself

The **Dataverse solution build** workflow uses Windows MSBuild, Node 22,
locked npm dependencies, .NET 10 and PAC CLI 2.12.2. It builds production PCF
resources and both solution ZIPs, then verifies solution/control identities,
version and bundle presence. The artifact also contains SHA-256 checksums
and the solution project's source metadata.

The solution project and publisher metadata are under
`solutions/Kickstart365Kanban`, so subsequent builds use the same source.
The workflow does not authenticate to Dataverse or deploy an environment.

On Windows with Visual Studio Build Tools/MSBuild:

```powershell
dotnet tool install --global Microsoft.PowerApps.CLI.Tool --version 2.12.2
npm ci --no-audit --no-fund
./scripts/build-solution.ps1
```

Microsoft reference:
[Import custom controls](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/import-custom-controls).

# Kickstart365 Kanban 1.9.0 DEV pilot

For all settings and examples, see the complete
[configuration manual](CONFIGURATION.md). For side panes, column colors,
editable fields and pilot checks, see [Interaction settings](INTERACTION-SETTINGS.md).
Upgrade the existing
`Kickstart365Kanban` installation using the matching managed/unmanaged package;
the control identity is unchanged from 1.8.

## Identity

- Control namespace: `kickstart365`; constructor: `KanbanViewControl`.
- Control version: `1.9.0`; display name: **Kickstart365 Kanban**.
- Solution: `Kickstart365Kanban`, version `1.9.0.0`.
- Publisher: `kickstart365`; customization prefix: `k365`.

This is a separate control identity, so it can be tested alongside the original
`novalogica` component. Existing views using the original control must be
explicitly configured to use the new one. Keep the upstream MIT license and
attribution when redistributing this fork.

## Build

The **Dataverse solution build** workflow uses Windows MSBuild, Node 22,
locked npm dependencies, .NET 10 and PAC CLI 2.12.2. It builds production PCF
resources and both managed/unmanaged solution ZIPs, then checks the packaged
solution/control identities, version and bundle presence. The artifact also
contains SHA-256 checksums and the solution project's source metadata.
The solution project and publisher metadata are committed under
`solutions/Kickstart365Kanban`, so subsequent builds use the same source.
It does not authenticate to or deploy into any Dataverse environment.

On a Windows machine with Visual Studio Build Tools/MSBuild:

```powershell
dotnet tool install --global Microsoft.PowerApps.CLI.Tool --version 2.12.2
npm ci --no-audit --no-fund
./scripts/build-solution.ps1
```

Microsoft packaging reference:
https://learn.microsoft.com/en-us/power-apps/developer/component-framework/import-custom-controls

## Install, upgrade and configure

1. Download the artifact from a green workflow run for the reviewed commit.
   Extract the artifact archive: import an inner solution ZIP, not the outer
   Actions artifact ZIP. Use `_unmanaged.zip` for development/customization, or
   `_managed.zip` to test the managed installation path.
2. Select the intended environment at https://make.powerapps.com, then import
   the chosen solution through **Solutions → Import**. If `Kickstart365Kanban`
   is already installed, use the matching package type: managed for managed,
   unmanaged for unmanaged. Keep the same solution identity and import the
   newer version; do not uninstall the control to perform this upgrade.
3. In the Opportunity view's control configuration, add **Kickstart365 Kanban**
   and follow [the configuration guide](OPPORTUNITY-CONFIGURATION.md).
4. Save/publish the view/app. In the app, select the view and, where needed,
   **Show as → Kickstart365 Kanban**; Microsoft Kanban is a separate control.
   Verify the runtime checks in that guide plus
   [the technical checks](OPPORTUNITY-FOUNDATION.md).

The package only contains the control. It creates no Opportunity view, BPF,
customer fields or model-driven app. This DEV build is not a claim that the
control has passed testing in an InSpark Dataverse environment.

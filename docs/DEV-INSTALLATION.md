# Kickstart365 Kanban 1.8.0 DEV pilot

## Identity

- Control namespace: `kickstart365`; constructor: `KanbanViewControl`.
- Control version: `1.8.0`; display name: **Kickstart365 Kanban**.
- Solution: `Kickstart365Kanban`, version `1.8.0.0`.
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
It does not authenticate to or deploy into any Dataverse environment.

On a Windows machine with Visual Studio Build Tools/MSBuild:

```powershell
dotnet tool install --global Microsoft.PowerApps.CLI.Tool --version 2.12.2
npm ci --no-audit --no-fund
./scripts/build-solution.ps1
```

Microsoft packaging reference:
https://learn.microsoft.com/en-us/power-apps/developer/component-framework/import-custom-controls

## Install and configure in DEV

1. Download the artifact from a green workflow run for the reviewed commit.
   Extract the artifact archive; the inner `_unmanaged.zip` is the DEV solution
   to import, rather than the outer Actions artifact ZIP. Keep the managed ZIP
   for testing the later release/import path.
2. Select the intended DEV environment at https://make.powerapps.com, then
   import the unmanaged solution through **Solutions → Import**.
3. In the Opportunity view's control configuration, add **Kickstart365 Kanban**
   and follow [the configuration guide](OPPORTUNITY-CONFIGURATION.md).
4. Save/publish the view/app and verify the runtime checks in that guide plus
   [the technical checks](OPPORTUNITY-FOUNDATION.md).

The package only contains the control. It creates no Opportunity view, BPF,
customer fields or model-driven app. This DEV build is not a claim that the
control has passed testing in an InSpark Dataverse environment.

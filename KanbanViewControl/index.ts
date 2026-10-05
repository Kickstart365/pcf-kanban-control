import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import App from "./App";
import { resolveConfiguration, exportConfiguration } from "./lib/board-config";

export class KanbanViewControl implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private datasetRevision = 0;
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        _: ComponentFramework.Dictionary
    ): void {
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        if (this.datasetRevision === 0 || context.updatedProperties?.includes("dataset")) {
            this.datasetRevision++;
        }
        const configuration = resolveConfiguration(context.parameters);
        // Preserve host services/prototype and dataset identity; never mutate host inputs.
        const effectiveContext = configuration.parameters === context.parameters ? context
            : Object.create(context) as ComponentFramework.Context<IInputs>;
        if (effectiveContext !== context) Object.defineProperty(effectiveContext, "parameters", { value: configuration.parameters });
        return React.createElement(App, {
            context: effectiveContext,
            configurationIssues: configuration.issues,
            configurationExport: exportConfiguration(configuration.parameters),
            datasetRevision: this.datasetRevision,
            notificationPosition: effectiveContext.parameters.notificationPosition?.raw
        });

    }

    public getOutputs(): IOutputs {
        return { };
    }

    public destroy(): void {
        // The PCF host owns the React tree returned by updateView.
        // This entry point has no component-owned resources to release.
    }
}

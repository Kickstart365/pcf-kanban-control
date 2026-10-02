import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import App from "./App";

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
        return React.createElement(App, { 
            context,  
            datasetRevision: this.datasetRevision,
            notificationPosition: context.parameters.notificationPosition?.raw
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

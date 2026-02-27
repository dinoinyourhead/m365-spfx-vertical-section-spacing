import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import AurumSpacer from './components/AurumSpacer';
import { IAurumSpacerProps } from './components/IAurumSpacerProps';

export interface IAurumSpacerWebPartProps {
  heightPx: number;
  showHelperInEditMode: boolean;
}

export default class AurumSpacerWebPart extends BaseClientSideWebPart<IAurumSpacerWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IAurumSpacerProps> = React.createElement(
      AurumSpacer,
      {
        heightPx: this.properties.heightPx,
        showHelperInEditMode: this.properties.showHelperInEditMode,
        displayMode: this.displayMode
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Aurum Spacer Configuration"
          },
          groups: [
            {
              groupName: "Settings",
              groupFields: [
                PropertyPaneSlider('heightPx', {
                  label: "Spacer Height (px)",
                  min: 1,
                  max: 50,
                  step: 1
                }),
                PropertyPaneToggle('showHelperInEditMode', {
                  label: "Show Helper in Edit Mode",
                  onText: "Yes",
                  offText: "No"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

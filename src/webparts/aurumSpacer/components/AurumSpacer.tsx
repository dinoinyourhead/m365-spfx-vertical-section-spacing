import * as React from 'react';
import styles from './AurumSpacer.module.scss';
import { IAurumSpacerProps } from './IAurumSpacerProps';
import { DisplayMode } from '@microsoft/sp-core-library';

export default class AurumSpacer extends React.Component<IAurumSpacerProps> {
  public render(): React.ReactElement<IAurumSpacerProps> {
    const { heightPx, showHelperInEditMode, displayMode } = this.props;
    const isEditMode = displayMode === DisplayMode.Edit;

    // View Mode: just the spacer
    if (!isEditMode) {
      return <div style={{ height: `${heightPx}px` }} />;
    }

    // Edit Mode
    if (showHelperInEditMode) {
      return (
        <div className={styles.aurumSpacer} style={{ height: `${heightPx}px`, border: '1px dashed #666', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
          <span style={{ fontSize: '12px', color: '#333' }}>Spacer ({heightPx}px)</span>
        </div>
      );
    }

    // Edit Mode but helper hidden (should be rare/optional)
    return <div style={{ height: `${heightPx}px` }} />;
  }
}

import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';

const CSS_ID: string = 'aurum-tight-vertical-css';
const OBSERVATION_ROOT_SELECTOR: string = 'div[data-automation-id="CanvasLayout"]';
const VERTICAL_SECTION_SELECTOR: string = 'div[data-automation-id="CanvasZone"].CanvasVerticalSection';
const MARKER_CLASS: string = 'aurum-tight-vertical-zone';

export interface IVerticalSectionSpacingApplicationCustomizerProperties {
  enabledPaths?: string[];
  disableInEditMode?: boolean;
  marginPx?: number;
  minWidthForApply?: number;
  debug?: boolean;
}

export default class VerticalSectionSpacingApplicationCustomizer
  extends BaseApplicationCustomizer<IVerticalSectionSpacingApplicationCustomizerProperties> {

  private _observer: MutationObserver | undefined;
  private _debounceTimer: number | undefined;

  public onInit(): Promise<void> {
    // Bind methods
    this._onNavigated = this._onNavigated.bind(this);

    // Initial check and enforce
    this._enforce();

    // Subscribe to navigation
    this.context.application.navigatedEvent.add(this, this._onNavigated);

    return Promise.resolve();
  }

  public onDispose(): void {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = undefined;
    }
    this.context.application.navigatedEvent.remove(this, this._onNavigated);
    this._removeStyle();
  }

  private _onNavigated(): void {
    this._enforce();
  }

  private _enforce(): void {
    const props = this.properties;

    // 1. Check Path
    let currentPath = window.location.pathname.toLowerCase();
    if (currentPath === "") {
      currentPath = "/";
    }
    const enabledPaths = (props.enabledPaths || [
      "/",
      "/sitepages/home.aspx",
      "/sitepages/collabhome.aspx"
    ]).map(p => (p || "").toLowerCase());

    const isEnabledPath = enabledPaths.indexOf(currentPath) !== -1 ||
      currentPath.endsWith("/sitepages/home.aspx") ||
      currentPath.endsWith("/sitepages/collabhome.aspx");

    console.log(`[VerticalSectionSpacing] currentPath: "${currentPath}"`);
    console.log(`[VerticalSectionSpacing] window.location.href: "${window.location.href}"`);
    console.log(`[VerticalSectionSpacing] isEnabledPath: ${isEnabledPath}`);

    if (!isEnabledPath) {
      this._disposeObserver();
      this._removeStyle();
      return;
    }

    // 2. Check Edit Mode
    const legacyContext = (this.context.pageContext as { legacyPageContext?: { isEditMode?: boolean } }).legacyPageContext;
    const isEditMode = (legacyContext && legacyContext.isEditMode) || (window.location.search.toLowerCase().indexOf('mode=edit') !== -1);

    if (isEditMode && props.disableInEditMode !== false) {
      this._disposeObserver();
      this._removeStyle();
      return;
    }

    // 3. Apply
    this._injectStyle();
    this._initObserver();

    // Also tag elements immediately
    this._tagElements();
  }

  private _injectStyle(): void {
    if (document.getElementById(CSS_ID)) return;

    const marginPx = this.properties.marginPx || 0;
    const minWidth = this.properties.minWidthForApply || 1024;

    const css = `
      @media (min-width: ${minWidth}px) {
        .${MARKER_CLASS}.CanvasZone--read [data-automation-id="CanvasControl"] {
          margin: ${marginPx}px !important;
        }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = CSS_ID;
    styleEl.innerHTML = css;
    document.head.appendChild(styleEl);
  }

  private _removeStyle(): void {
    const styleEl = document.getElementById(CSS_ID);
    if (styleEl) {
      styleEl.remove();
    }
    // Also remove markers
    document.querySelectorAll(`.${MARKER_CLASS}`).forEach(el => el.classList.remove(MARKER_CLASS));
  }

  private _initObserver(): void {
    if (this._observer) {
      return;
    }

    // Root to observe: CanvasLayout is best, fallback to body
    const rootNode = document.querySelector(OBSERVATION_ROOT_SELECTOR) || document.body;

    this._observer = new MutationObserver((mutations) => {
      // Debounce logic
      if (this._debounceTimer) {
        clearTimeout(this._debounceTimer);
      }
      this._debounceTimer = window.setTimeout(() => {
        this._tagElements();
      }, 200);
    });

    this._observer.observe(rootNode, {
      childList: true,
      subtree: true,
      attributes: false // we care about nodes added (webparts loading)
    });
  }

  private _disposeObserver(): void {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = undefined;
    }
  }

  private _tagElements(): void {
    // Find Vertical Section(s)
    const candidates = document.querySelectorAll(VERTICAL_SECTION_SELECTOR);
    candidates.forEach(el => {
      if (!el.classList.contains(MARKER_CLASS)) {
        el.classList.add(MARKER_CLASS);
      }
    });

    // Also check if observer root needs update (e.g. if we started on body but now Layout exists)
    // This is optional optimization
  }
}

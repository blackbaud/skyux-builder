import { SkyHostBrowserBreakpoint } from './host-browser-breakpoint';

export declare class SkyHostBrowser {
  public static get(url: string, timeout?: number): any;
  public static moveCursorOffScreen(): void;
  public static setWindowBreakpoint(breakpoint?: SkyHostBrowserBreakpoint): void;
  public static setWindowDimensions(width: number, height: number): void;
  public static scrollTo(selector: string): void;
}

import { SkyHostBrowserBreakpoint } from './host-browser-breakpoint';

export interface SkyCompareScreenshotConfig {
  screenshotName: string;
  selector?: string;
  breakpoint?: SkyHostBrowserBreakpoint;
}

export declare class SkyVisualTest {
  public static compareScreenshot(config: SkyCompareScreenshotConfig): Promise<any>;
}

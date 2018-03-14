export type SkyVisualTestBreakpoint = 'xs' | 'sm' | 'md' | 'lg';

export interface SkyCompareScreenshotConfig {
  screenshotName: string;
  selector?: string;
  breakpoint?: SkyVisualTestBreakpoint;
}

export declare class SkyVisualTest {
  public static compareScreenshot(config: SkyCompareScreenshotConfig): Promise<any>;
  public static scrollTo(selector: string): void;
  public static moveCursorOffScreen(): void;
  public static resizeWindow(breakpoint?: SkyVisualTestBreakpoint): void;
}

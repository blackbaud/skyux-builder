function getWindow() {
  return window;
}

export class SkyAppWindowRef {
  public get nativeWindow() {
    return getWindow();
  }
}

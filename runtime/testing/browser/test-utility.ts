export interface SkyAppTestUtilityEventArgs {
  bubbles?: boolean;
  cancelable?: boolean;
}

function getWindow() {
  return window;
}

export class SkyAppTestUtility {
  public static fireDomEvent(
    element: EventTarget,
    eventName: string,
    args?: SkyAppTestUtilityEventArgs
  ) {
    const defaults = { bubbles: true, cancelable: true };
    const options = Object.assign({}, defaults, args);
    const event = getWindow().document.createEvent('CustomEvent');

    event.initEvent(eventName, options.bubbles, options.cancelable);
    element.dispatchEvent(event);
  }
}

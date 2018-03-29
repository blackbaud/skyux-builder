import { SkyAppTestUtilityDomEventOptions } from './test-utility-dom-event-options';

export class SkyAppTestUtility {
  public static fireDomEvent(
    element: EventTarget,
    eventName: string,
    options?: SkyAppTestUtilityDomEventOptions
  ) {
    const defaults = { bubbles: true, cancelable: true };
    const { bubbles, cancelable } = Object.assign({}, defaults, options);

    const event = document.createEvent('CustomEvent');
    event.initEvent(eventName, bubbles, cancelable);

    element.dispatchEvent(event);
  }
}

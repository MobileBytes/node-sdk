import { decode as base64Decode, encode as base64Encode } from "base-64";

export class StringUtils {
  public static leftPad(
    source: string,
    length: number,
    padString: string,
  ): string {
    if (!source) {
      return source;
    }
    const pad = padString.repeat(length);
    return pad.substring(0, pad.length - source.length) + source;
  }

  public static uuid() {
    //// return uuid of form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    let uuid = "";
    let ii;
    for (ii = 0; ii < 32; ii += 1) {
      switch (ii) {
        case 8:
        case 20:
          uuid += "-";
          uuid += ((Math.random() * 16) | 0).toString(16);
          break;
        case 12:
          uuid += "-";
          uuid += "4";
          break;
        case 16:
          uuid += "-";
          uuid += ((Math.random() * 4) | 8).toString(16);
          break;
        default:
          uuid += ((Math.random() * 16) | 0).toString(16);
      }
    }
    return uuid;
  }

  public static btoa(t: string) {
    if (typeof btoa === "function") {
      return btoa(t);
    }

    return base64Encode(t);
  }

  public static atob(t: string) {
    if (typeof atob === "function") {
      return atob(t);
    }

    return base64Decode(t);
  }
}

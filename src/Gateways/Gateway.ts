import { IDictionary } from "../Builders";
import { request, RequestOptions } from "./http-transport";

export abstract class Gateway {
  public headers: IDictionary<string>;
  public timeout: number;
  public serviceUrl: string;
  private contentType: string;

  public constructor(contentType: string) {
    this.contentType = contentType;
    this.headers = {};
    this.headers["Content-Type"] = contentType;
  }

  public sendRequest(
    httpMethod: string,
    endpoint: string,
    data?: string,
    queryStringParams?: IDictionary<string>,
  ) {
    const queryString = this.buildQueryString(queryStringParams);
    const url = new URL(endpoint + queryString, this.serviceUrl);
    const options: RequestOptions = {
      headers: this.headers,
      method: httpMethod,
      timeoutMs: this.timeout,
    };

    return request(url.toString(), data, options);
  }

  protected buildQueryString(queryStringParams?: IDictionary<string>) {
    if (queryStringParams === undefined) {
      return "";
    }
    const params: string[] = [];
    for (const param in queryStringParams) {
      if (queryStringParams.hasOwnProperty(param)) {
        params.push(
          `${encodeURIComponent(param)}=${encodeURIComponent(
            queryStringParams[param],
          )}`,
        );
      }
    }

    return `?${params.join("&")}`;
  }
}

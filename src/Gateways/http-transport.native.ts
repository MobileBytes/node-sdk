import { ApiError, GatewayError } from "../Entities/Errors";

export interface RequestOptions {
  headers?: { [key: string]: any };
  method?: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT = 100000;

export type Transport = (
  url: string,
  data?: string,
  options?: RequestOptions,
) => Promise<string>;

// React Native transport using fetch API
export const request: Transport = async (url, data, options) => {
  const timeoutMs = (options && options.timeoutMs) || DEFAULT_TIMEOUT;

  const normalizedUrl = url.replace(/\/+$/, "");

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new ApiError("Request timeout occurred.")),
      timeoutMs,
    );
  });

  try {
    const response = await Promise.race([
      fetch(normalizedUrl, {
        method: (options && options.method) || "GET",
        headers: options && options.headers,
        body: data,
      }),
      timeoutPromise,
    ]);

    if (response.status < 200 || response.status >= 300) {
      throw new GatewayError(
        `Unexpected HTTP status code [${response.status}]`,
      );
    }

    return await response.text();
  } catch (error) {
    throw error;
  }
};

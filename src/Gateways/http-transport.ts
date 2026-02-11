import { ApiError, GatewayError } from "../Entities/Errors";

// tslint:disable-next-line:no-var-requires
const https = require("https");

export interface RequestOptions {
  headers?: { [key: string]: any };
  method?: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT = 100000;

export type Transport = (url: string, data?: string, options?: RequestOptions) => Promise<string>;

// Node.js transport using native https module
export const request: Transport = (url, data, options) => {
  return new Promise((resolve, reject) => {
    let parsed: any;
    try {
      parsed = new URL(url);
    } catch (e) {
      reject(e);
      return;
    }

    const headers = (options && options.headers) ? { ...options.headers } : {};

    if (data !== undefined && !headers["Content-Length"] && !headers["content-length"]) {
      headers["Content-Length"] = Buffer.byteLength(data);
    }

    const reqOptions: any = {
      method: (options && options.method) || "GET",
      headers: headers,
      hostname: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : parsed.protocol === "http:" ? 80 : 443,
      path: parsed.pathname + parsed.search,
    };

    const req = https.request(reqOptions, (res: any) => {
      let responseData = "";
      res.on("data", (chunk: any) => {
        responseData += chunk.toString();
      });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new GatewayError(`Unexpected HTTP status code [${res.statusCode}]`));
          return;
        }
        resolve(responseData);
      });
      res.on("error", reject);
    });

    const timeoutMs = (options && options.timeoutMs) || DEFAULT_TIMEOUT;
    req.on("socket", (socket: any) => {
      socket.setTimeout(timeoutMs);
      socket.on("timeout", () => {
        req.abort();
        reject(new ApiError("Request timeout occurred."));
      });
    });

    req.on("error", reject);

    if (data !== undefined) {
      req.write(data);
    }
    req.end();
  });
};

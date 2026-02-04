import { ApiError, GatewayError } from "../Entities/Errors";

export interface RequestOptions {
  headers?: { [key: string]: any };
  method?: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT = 100000;

export type Transport = (url: string, data?: string, options?: RequestOptions) => Promise<string>;

const isReactNative = (): boolean => {
  return typeof navigator !== "undefined" && (navigator as any).product === "ReactNative";
};

// Lazy load https module only when needed (avoids Metro static analysis)
const getNodeHttps = (): any => {
  if (isReactNative()) {
    return undefined;
  }
  try {
    if (typeof process !== "undefined" && process.versions && process.versions.node) {
      // Dynamic require to avoid Metro bundler static analysis
      // tslint:disable-next-line:no-var-requires
      const mod = "https";
      return require(mod);
    }
  } catch (_e) {
    // Not in Node.js environment
  }
  return undefined;
};

const nodeTransport: Transport = (url, data, options) => {
  const nodeHttps = getNodeHttps();
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

    const req = nodeHttps.request(reqOptions, (res: any) => {
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

const reactNativeTransport: Transport = async (url, data, options) => {
  const timeoutMs = (options && options.timeoutMs) || DEFAULT_TIMEOUT;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new ApiError("Request timeout occurred.")), timeoutMs);
  });

  try {
    const response = await Promise.race([
      fetch(url, {
        method: (options && options.method) || "GET",
        headers: options && options.headers,
        body: data,
      }),
      timeoutPromise
    ]);

    if (response.status < 200 || response.status >= 300) {
      throw new GatewayError(`Unexpected HTTP status code [${response.status}]`);
    }

    return await response.text();
  } catch (error) {
    throw error;
  }
};

export const request: Transport = (url, data, options) => {
  if (!isReactNative()) {
    const nodeHttps = getNodeHttps();
    if (nodeHttps) {
      return nodeTransport(url, data, options);
    }
  }
  if (isReactNative()) {
    return reactNativeTransport(url, data, options);
  }
  throw new ApiError("No HTTP transport available for this environment.");
};

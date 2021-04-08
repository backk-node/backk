export const MAX_INT_VALUE = 2147483647;

// noinspection MagicNumberJS
export class Lengths {
  static readonly _1 = 1 as number;
  static readonly _2 = 2 as number;
  static readonly _4 = 4 as number;
  static readonly _8 = 8 as number;
  static readonly _16 = 16 as number;
  static readonly _32 = 32 as number;
  static readonly _64 = 64 as number;
  static readonly _128 = 128 as number;
  static readonly _256 = 256 as number;
  static readonly _512 = 512 as number;
  static readonly _1024 = 1024 as number;

  static readonly _1K = Lengths._1024;
  static readonly _2K = 2 * Lengths._1024;
  static readonly _4K = 4 * Lengths._1024;
  static readonly _8K = 8 * Lengths._1024;
  static readonly _16K = 16 * Lengths._1024;
  static readonly _32K = 32 * Lengths._1024;
  static readonly _64K = 64 * Lengths._1024;
  static readonly _128K = 128 * Lengths._1024;
  static readonly _256K = 256 * Lengths._1024;
  static readonly _512K = 512 * Lengths._1024;
  static readonly _1024K = 1024 * Lengths._1024;

  static readonly _1M = Lengths._1024K;
  static readonly _2M = 2 * Lengths._1024K;
  static readonly _3M = 3 * Lengths._1024K;
  static readonly _4M = 4 * Lengths._1024K;
  static readonly _5M = 5 * Lengths._1024K;
  static readonly _6M = 6 * Lengths._1024K;
  static readonly _7M = 7 * Lengths._1024K;
  static readonly _8M = 8 * Lengths._1024K;
  static readonly _9M = 9 * Lengths._1024K;
  static readonly _10M = 10 * Lengths._1024K;
  static readonly _16M = 16 * Lengths._1024K;
  static readonly _32M = 32 * Lengths._1024K;
  static readonly _64M = 64 * Lengths._1024K;
  static readonly _128M = 128 * Lengths._1024K;
  static readonly _256M = 256 * Lengths._1024K;
  static readonly _512M = 512 * Lengths._1024K;
}

export class Values {
  static readonly _24 = 24;
  static readonly _25 = 25;
  static readonly _50 = 50;
  static readonly _100 = 100;
  static readonly _200 = 200;
  static readonly _250 = 250;
  static readonly _500 = 500;
  static readonly _1K = 1000;
  static readonly _10K = 10000;
  static readonly _100K = 100000;
  static readonly _1M = 1000000;
  static readonly _10M = 10000000;
  static readonly _100M = 100000000;
  static readonly _1B = 1000000000;
}

export class HttpStatusCodes {
  static readonly SUCCESS = 200;
  static readonly ERRORS_START = 300;
  static readonly MOVED_PERMANENTLY = 301;
  static readonly NOT_MODIFIED = 304;
  static readonly CLIENT_ERRORS_START = 400;
  static readonly BAD_REQUEST = 400;
  static readonly FORBIDDEN = 403;
  static readonly NOT_FOUND = 404;
  static readonly CONFLICT = 409;
  static readonly INTERNAL_ERRORS_START = 500;
  static readonly INTERNAL_SERVER_ERROR = 500;
  static readonly SERVICE_UNAVAILABLE = 503;
}

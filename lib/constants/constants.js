"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpStatusCodes = exports.Values = exports.Lengths = exports.MAX_INT_VALUE = void 0;
exports.MAX_INT_VALUE = 2147483647;
class Lengths {
}
exports.Lengths = Lengths;
Lengths._1 = 1;
Lengths._2 = 2;
Lengths._4 = 4;
Lengths._8 = 8;
Lengths._16 = 16;
Lengths._32 = 32;
Lengths._64 = 64;
Lengths._128 = 128;
Lengths._256 = 256;
Lengths._512 = 512;
Lengths._1024 = 1024;
Lengths._1K = Lengths._1024;
Lengths._2K = 2 * Lengths._1024;
Lengths._4K = 4 * Lengths._1024;
Lengths._8K = 8 * Lengths._1024;
Lengths._16K = 16 * Lengths._1024;
Lengths._32K = 32 * Lengths._1024;
Lengths._64K = 64 * Lengths._1024;
Lengths._128K = 128 * Lengths._1024;
Lengths._256K = 256 * Lengths._1024;
Lengths._512K = 512 * Lengths._1024;
Lengths._1024K = 1024 * Lengths._1024;
Lengths._1M = Lengths._1024K;
Lengths._2M = 2 * Lengths._1024K;
Lengths._3M = 3 * Lengths._1024K;
Lengths._4M = 4 * Lengths._1024K;
Lengths._5M = 5 * Lengths._1024K;
Lengths._6M = 6 * Lengths._1024K;
Lengths._7M = 7 * Lengths._1024K;
Lengths._8M = 8 * Lengths._1024K;
Lengths._9M = 9 * Lengths._1024K;
Lengths._10M = 10 * Lengths._1024K;
Lengths._16M = 16 * Lengths._1024K;
Lengths._32M = 32 * Lengths._1024K;
Lengths._64M = 64 * Lengths._1024K;
Lengths._128M = 128 * Lengths._1024K;
Lengths._256M = 256 * Lengths._1024K;
Lengths._512M = 512 * Lengths._1024K;
class Values {
}
exports.Values = Values;
Values._24 = 24;
Values._25 = 25;
Values._50 = 50;
Values._100 = 100;
Values._200 = 200;
Values._250 = 250;
Values._500 = 500;
Values._1K = 1000;
Values._10K = 10000;
Values._100K = 100000;
Values._1M = 1000000;
Values._10M = 10000000;
Values._100M = 100000000;
Values._1B = 1000000000;
class HttpStatusCodes {
}
exports.HttpStatusCodes = HttpStatusCodes;
HttpStatusCodes.SUCCESS = 200;
HttpStatusCodes.ERRORS_START = 300;
HttpStatusCodes.MOVED_PERMANENTLY = 301;
HttpStatusCodes.NOT_MODIFIED = 304;
HttpStatusCodes.CLIENT_ERRORS_START = 400;
HttpStatusCodes.BAD_REQUEST = 400;
HttpStatusCodes.FORBIDDEN = 403;
HttpStatusCodes.NOT_FOUND = 404;
HttpStatusCodes.CONFLICT = 409;
HttpStatusCodes.INTERNAL_ERRORS_START = 500;
HttpStatusCodes.INTERNAL_SERVER_ERROR = 500;
HttpStatusCodes.SERVICE_UNAVAILABLE = 503;
//# sourceMappingURL=constants.js.map
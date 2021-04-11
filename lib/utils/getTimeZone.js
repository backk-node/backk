"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getTimeZone() {
    const timezoneOffset = new Date().getTimezoneOffset();
    const absoluteTimezoneOffset = Math.abs(timezoneOffset);
    return ((timezoneOffset < 0 ? '+' : '-') +
        ('00' + Math.floor(absoluteTimezoneOffset / 60)).slice(-2) +
        ':' +
        ('00' + (absoluteTimezoneOffset % 60)).slice(-2));
}
exports.default = getTimeZone;
//# sourceMappingURL=getTimeZone.js.map
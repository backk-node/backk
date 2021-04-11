"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@opentelemetry/node");
const tracerProvider = new node_1.NodeTracerProvider({
    plugins: {
        express: {
            enabled: false
        }
    }
});
tracerProvider.register();
exports.default = tracerProvider;
//# sourceMappingURL=tracerProvider.js.map
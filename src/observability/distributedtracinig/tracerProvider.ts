import { NodeTracerProvider } from "@opentelemetry/node";

const tracerProvider = new NodeTracerProvider({
  plugins: {
    express: {
      enabled: false
    }
  }
});

tracerProvider.register();

export default tracerProvider;

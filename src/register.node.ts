export * from "@opentelemetry/api";

import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import {
  ConsoleSpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";

export const registerOTel = (serviceName: string) => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  });

  provider.register();

  provider.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter({})));
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

  return provider;
};
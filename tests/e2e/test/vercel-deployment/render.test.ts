import { expect, it } from "vitest";
import { SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { describe } from "../../lib/with-bridge";
import { expectTrace } from "../../lib/expect-trace";

describe("vercel deployment: render", {}, (props) => {
  it("should trace render for serverless", async () => {
    const { port, collector, bridge } = props();

    const execResp = await bridge.fetch("/slugs/baz");
    expect(execResp.status).toBe(200);
    void execResp.arrayBuffer();

    await expectTrace(collector, {
      name: "GET /slugs/[slug]",
      status: { code: SpanStatusCode.UNSET },
      kind: SpanKind.SERVER,
      resource: {
        "service.name": "sample-app",
        "vercel.runtime": "nodejs",
        "vercel.env": "test",
      },
      attributes: {
        scope: "next.js",
        "next.span_name": "GET /slugs/[slug]",
        "next.span_type": "BaseServer.handleRequest",
        "http.method": "GET",
        "http.target": "/slugs/baz",
        "http.host": `127.0.0.1:${port}`,
        "http.status_code": 200,
        "next.route": "/slugs/[slug]",
        "http.route": "/slugs/[slug]",
      },
      spans: [
        {
          name: "resolve page components",
          attributes: {
            scope: "next.js",
            "next.span_name": "resolve page components",
            "next.span_type": "NextNodeServer.findPageComponents",
          },
          spans: [],
        },
        {
          name: "render route (app) /slugs/[slug]",
          kind: SpanKind.INTERNAL,
          attributes: {
            scope: "next.js",
            "next.span_name": "render route (app) /slugs/[slug]",
            "next.span_type": "AppRender.getBodyResult",
            "next.route": "/slugs/[slug]",
          },
          spans: [
            {
              name: "resolve segment modules",
              attributes: {
                scope: "next.js",
                "next.segment": "",
                "next.span_name": "resolve segment modules",
                "next.span_type": "NextNodeServer.getLayoutOrPageModule",
              },
            },
            {
              name: "resolve segment modules",
              attributes: {
                scope: "next.js",
                "next.segment": "__PAGE__",
                "next.span_name": "resolve segment modules",
                "next.span_type": "NextNodeServer.getLayoutOrPageModule",
              },
            },
            {
              name: "sample-span",
              kind: SpanKind.INTERNAL,
              attributes: { scope: "sample", foo: "bar" },
              spans: [],
            },
          ],
        },
      ],
    });
  });

  it("should trace render for edge", async () => {
    const { port, collector, bridge } = props();

    const execResp = await bridge.fetch("/slugs/baz/edge");
    expect(execResp.status).toBe(200);
    void execResp.arrayBuffer();

    await expectTrace(collector, {
      name: "GET /slugs/[slug]/edge",
      status: { code: SpanStatusCode.UNSET },
      kind: SpanKind.SERVER,
      resource: {
        "service.name": "sample-app",
        "vercel.runtime": "edge",
        "vercel.env": "test",
      },
      attributes: {
        scope: "next.js",
        "next.span_name": "GET /slugs/[slug]/edge",
        "next.span_type": "BaseServer.handleRequest",
        "http.method": "GET",
        "http.host": `127.0.0.1:${port}`,
        "http.status_code": 200,
        "next.route": "/slugs/[slug]/edge",
        "http.route": "/slugs/[slug]/edge",
      },
      spans: [
        {
          name: "render route (app) /slugs/[slug]/edge",
          kind: SpanKind.INTERNAL,
          attributes: {
            scope: "next.js",
            "next.span_name": "render route (app) /slugs/[slug]/edge",
            "next.span_type": "AppRender.getBodyResult",
            "next.route": "/slugs/[slug]/edge",
          },
          spans: [
            {
              name: "resolve segment modules",
              attributes: {
                scope: "next.js",
                "next.segment": "",
                "next.span_name": "resolve segment modules",
                "next.span_type": "NextNodeServer.getLayoutOrPageModule",
              },
            },
            {
              name: "resolve segment modules",
              attributes: {
                scope: "next.js",
                "next.segment": "__PAGE__",
                "next.span_name": "resolve segment modules",
                "next.span_type": "NextNodeServer.getLayoutOrPageModule",
              },
            },
            {
              name: "sample-span",
              kind: SpanKind.INTERNAL,
              attributes: { scope: "sample", foo: "bar" },
              spans: [],
            },
          ],
        },
      ],
    });
  });
});
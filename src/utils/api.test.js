import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("cookie-auth API transport", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("sends state-changing requests with credentials and the CSRF header, never a Bearer token", async () => {
    const request = vi.fn(async (url) => url.endsWith("/api/auth/csrf")
      ? { ok: true, json: async () => ({ token: "csrf-test-value" }) }
      : { ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", request);
    const { api } = await import("./api");

    await api.login({ email: "alice@example.test", password: "not-a-real-secret" });

    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[0][1]).toMatchObject({ credentials: "include" });
    const loginOptions = request.mock.calls[1][1];
    expect(loginOptions.credentials).toBe("include");
    expect(loginOptions.headers.get("X-XSRF-TOKEN")).toBe("csrf-test-value");
    expect(loginOptions.headers.has("Authorization")).toBe(false);
    expect(api.authHeader()).toEqual({});
  });

  it("sends credentials on protected reads so the browser can attach its HttpOnly cookie", async () => {
    const request = vi.fn(async () => ({ ok: true, json: async () => [] }));
    vi.stubGlobal("fetch", request);
    const { api } = await import("./api");

    await api.getPosts();

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][1].credentials).toBe("include");
    expect(request.mock.calls[0][1].headers.has("Authorization")).toBe(false);
  });
});

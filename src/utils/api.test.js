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

  it("sends the registration payload with cookie credentials and a CSRF token", async () => {
    const request = vi.fn(async (url) => url.endsWith("/api/auth/csrf")
      ? { ok: true, json: async () => ({ token: "csrf-register-value" }) }
      : { ok: true, json: async () => ({ userId: 1 }) });
    vi.stubGlobal("fetch", request);
    const { api } = await import("./api");
    const payload = {
      username: "alice-demo",
      email: "alice@example.test",
      password: "SecurePassword123!",
      acceptTerms: true,
    };

    await api.register(payload);

    const registerCall = request.mock.calls[1];
    expect(registerCall[0]).toContain("/api/auth/register");
    expect(registerCall[1].credentials).toBe("include");
    expect(registerCall[1].headers.get("X-XSRF-TOKEN")).toBe("csrf-register-value");
    expect(JSON.parse(registerCall[1].body)).toEqual(payload);
  });

  it("extracts a useful backend error message instead of exposing raw JSON", async () => {
    const request = vi.fn(async () => ({ ok: true, json: async () => ({}) }));
    vi.stubGlobal("fetch", request);
    const { api } = await import("./api");
    const response = {
      headers: { get: () => "application/json" },
      json: async () => ({ error: "password: Le mot de passe doit contenir entre 12 et 128 caractères" }),
    };

    await expect(api.errorMessage(response)).resolves.toBe(
      "password: Le mot de passe doit contenir entre 12 et 128 caractères",
    );
  });
});

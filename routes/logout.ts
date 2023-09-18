import { Handlers } from "$fresh/server.ts";
import { deleteCookie, getCookies } from "$std/http/cookie.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const headers = new Headers(req.headers);
    const kv = await Deno.openKv();
    const cookies = getCookies(req.headers);
    
    if (cookies.username) {
      kv.delete(['session', cookies.username]);
    }

    deleteCookie(headers, "username", { path: "/", domain: url.hostname });

    headers.set("location", "/");
    return new Response(null, {
      status: 302,
      headers,
    });
  },
};
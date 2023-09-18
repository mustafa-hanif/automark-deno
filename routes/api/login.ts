import { Handlers } from "$fresh/server.ts";
import { setCookie } from "$std/http/cookie.ts";

export const handler: Handlers = {
  async POST(req) {
    const kv = await Deno.openKv();
    const url = new URL(req.url);
    const form = await req.formData();
    const username = form.get("username");

    const headers = new Headers();
    setCookie(headers, {
      name: "username",
      value: username, // this should be a unique value for each session
      maxAge: 1200,
      sameSite: "Lax", // this is important to prevent CSRF attacks
      domain: url.hostname,
      path: "/",
    });

    if (form.get("username") === "deno" && form.get("password") === "land") {
      const session = {
        username: username,
        status: 'logged_in'
      };

      const result = await kv.set(["session", username], session);
      console.log(["session", username], result);
      headers.set("location", "/");
      return new Response(null, {
        status: 303, // "See Other"
        statusText: "Success",
        headers,
      });
    } else {
      const session = {
        username: username,
        status: 'invalid_attempt'
      };

      const result = await kv.set(["session", username], session);

      const headers = new Headers();
      headers.set("location", "/");
      return new Response(null, {
        status: 303,
        statusText: "Failure",
        headers,
      });
    }
  },
};
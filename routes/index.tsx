import { getCookies } from "$std/http/cookie.ts";
import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";
import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";
import { JSX } from "preact";
import { ShadButton } from "../components/ShadButton.tsx";

interface Data {
  isAllowed: boolean;
}

export const handler: Handlers = {
  async GET(req: Request, ctx: HandlerContext) {
    const kv = await Deno.openKv();
    const cookies = getCookies(req.headers);
    console.log('username', cookies.username);
    if (cookies.username) {
      const entry = await kv.get(["session", cookies.username]);
      console.log(entry.value);
      if (entry.value.status === 'logged_in') {
        return ctx.render!({ isAllowed: true });    
      }
    }
    
    return ctx.render!({ isAllowed: cookies.auth === "bar" });
  },
};

function Login() {
  return (
    <form method="post" action="/api/login">
      <input type="text" name="username" />
      <input type="password" name="password" />
      <button type="submit">Submit</button>
    </form>
  );
}

export default function Home({ data }: PageProps<Data>) {
  const count = useSignal(3);
  console.log(data);
  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <div>
        You currently {data.isAllowed ? "are" : "are not"} logged in.
      </div>
      {!data.isAllowed ? <Login /> : <a href="/logout">Logout</a>}
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="128"
          alt="the Fresh logo: a sliced lemon dripping with juice"
        />
        <h1 class="text-4xl font-bold">Welcome to Fresh</h1>
        <p class="my-4">
          Try updating this message in the
          <code class="mx-2">./routes/index.tsx</code> file, and refresh.
        </p>
        <Counter count={count} />
      </div>
    </div>
  );
}

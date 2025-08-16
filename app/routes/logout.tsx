import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getSession, destroySession } from "../lib/session.server";

export async function action({ request }: LoaderFunctionArgs) {
  // Get the session and destroy it
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

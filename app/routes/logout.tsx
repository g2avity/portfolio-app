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

export default function Logout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Logging out...</h1>
        <p className="text-gray-600">Please wait while we sign you out.</p>
      </div>
    </div>
  );
}

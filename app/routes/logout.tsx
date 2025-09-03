import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getSession, destroySession } from "../lib/session.server";
import { useEffect } from "react";
import { useSubmit } from "react-router";

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
  const submit = useSubmit();

  useEffect(() => {
    // Automatically trigger logout when component mounts after a short delay
    const timer = setTimeout(() => {
      const formData = new FormData();
      submit(formData, { method: "post" });
    }, 1500);

    return () => clearTimeout(timer);
  }, [submit]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Logging out...</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Please wait while we sign you out.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--text-primary)' }}></div>
        </div>
      </div>
    </div>
  );
}

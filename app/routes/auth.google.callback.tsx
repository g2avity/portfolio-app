import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { authenticator } from "../lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle the OAuth callback
  return authenticator.authenticate("google", request);
}

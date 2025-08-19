import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { authenticator } from "../lib/auth.server";

export async function action({ request }: LoaderFunctionArgs) {
  // Initiate Google OAuth flow
  return authenticator.authenticate("google", request);
}

import { LoaderFunctionArgs, redirect } from "@react-router/node";
import { authenticator } from "../lib/auth.server";

export async function action({ request }: LoaderFunctionArgs) {
  // Initiate Google OAuth flow
  return authenticator.authenticate("google", request);
}

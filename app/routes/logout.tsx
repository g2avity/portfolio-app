import { LoaderFunctionArgs, redirect } from "@react-router/node";
import { authenticator } from "../lib/auth.server";

export async function action({ request }: LoaderFunctionArgs) {
  // Logout the user
  return authenticator.logout(request, { redirectTo: "/" });
}

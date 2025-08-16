import { LoaderFunctionArgs, redirect } from "@react-router/node";
import { authenticator } from "../lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle the OAuth callback
  return authenticator.authenticate("google", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
}

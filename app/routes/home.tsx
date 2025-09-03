import { Hero } from "../components/hero";
import type { LoaderFunctionArgs } from "react-router";
import { useSearchParams } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const message = url.searchParams.get("message");
  return { message };
}

export function meta() {
  return [
    { title: "Portfolios by G2avity" },
    { name: "description", content: "Professional portfolio platform built with modern web technologies" },
  ];
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message");

  return (
    <>
      {message && (
        <div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 rounded-md p-4 shadow-lg border"
          style={{ 
            backgroundColor: 'var(--success-bg)', 
            borderColor: 'var(--success-border)',
            color: 'var(--success-text)'
          }}
        >
          <p className="text-sm">{message}</p>
        </div>
      )}
      <Hero />
    </>
  );
}

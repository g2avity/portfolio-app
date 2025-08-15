import { Hero } from "../components/hero";

export function meta() {
  return [
    { title: "Portfolios by G2avity" },
    { name: "description", content: "Professional portfolio platform built with modern web technologies" },
  ];
}

export default function Home() {
  return <Hero />;
}

import type { Metadata } from "next";
import "./(default)/globals.css";

export const metadata: Metadata = {
  title: "Affensus",
  description: "AI-Powered Solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

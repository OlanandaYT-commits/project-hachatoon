import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Summer Quests",
  description: "Summer isn't infinite. A live countdown, AI-generated quests, and a streak you'll want to share.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

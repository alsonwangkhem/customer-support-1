import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"
 
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Nerdation AI customer support",
  description: "Customer support AI bot for a student's productivity app, Nerdation, which is a note taking app like notion powered by AI features to summarize notes and automatically generate flashcards from the notes and uploaded pdfs. it also has spaced repetition algorithm to show the flashcards to the student, and virtual trophies and leaderboards to increase competition among the users",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
          "h-screen bg-background font-sans antialiased bg-slate-300 flex justify-center items-center",
          fontSans.variable
        )}>{children}</body>
    </html>
  );
}

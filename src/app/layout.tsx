import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Datanyx 2k25",
  description: "Hackathon organised by SMC and AWS in colaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >

        {children}
        
      </body>
    </html>
  );
}

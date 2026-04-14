import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aether-Scan Pro | Editorial Visualization Studio",
  description: "Next-generation 3D reconstruction and virtual navigation engine.",
};

export default function RootLayout({

  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="font-serif antialiased h-full overflow-hidden bg-background">

        <div className="fixed inset-0 grid-bg pointer-events-none" />
        <div className="scanline pointer-events-none" />
        
        <main className="relative z-10 flex flex-col h-full">
          {children}
        </main>

        {/* Technical Border Overlay */}
        <div className="fixed inset-0 pointer-events-none border-[12px] border-background z-50" />
        <div className="fixed inset-[12px] pointer-events-none border border-border/30 z-50" />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'VedaAI – AI Assessment Creator',
  description: 'Create AI-powered question papers for your students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-surface">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

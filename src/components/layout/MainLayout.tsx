import Navbar from './Navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
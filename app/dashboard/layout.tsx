import { SmartNavbar } from "@/components/SmartNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background pt-16">
      <SmartNavbar />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}

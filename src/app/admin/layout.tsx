import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/auth';
// import { redirect } from 'next/navigation';
import { SignOutButton } from './sign-out-button';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    // Double check logic, though middleware should handle this
    // redirect('/auth/login'); 
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 text-slate-900 hidden md:block">
        <div className="p-6">
          <Image
            src="/logo.png"
            alt="Mayday Saxonvale"
            width={200}
            height={60}
            className="mb-2"
          />
        </div>
        <nav className="px-4 space-y-2">
          <Link href="/admin" className="block py-2 px-4 hover:bg-emerald-50 hover:text-emerald-700 rounded transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/applications" className="block py-2 px-4 hover:bg-emerald-50 hover:text-emerald-700 rounded transition-colors">
            Investors
          </Link>
          <Link href="/admin/payments" className="block py-2 px-4 hover:bg-emerald-50 hover:text-emerald-700 rounded transition-colors">
            Reconciliation
          </Link>
          <Link href="/admin/settings" className="block py-2 px-4 hover:bg-emerald-50 hover:text-emerald-700 rounded transition-colors">
            Settings
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200">
          <div className="text-sm text-slate-600 mb-2">{session?.user?.email}</div>
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 md:hidden border-b border-slate-200">
          <Image
            src="/logo.png"
            alt="Mayday Saxonvale"
            width={150}
            height={40}
            className="h-8 w-auto"
          />
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}


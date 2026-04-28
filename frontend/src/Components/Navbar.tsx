'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, BarChart3, Search, Map } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/lookup', icon: Search, label: 'Lookup' },
    { path: '/map', icon: Map, label: 'Map' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <Shield className="w-8 h-8 text-red-500" />
        <h1 className="text-2xl font-bold text-white">ThreatLens</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            href={path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(path)
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-800 text-gray-500 text-sm">
        <p>Threat Intelligence</p>
        <p>Dashboard v1.0</p>
      </div>
    </aside>
  );
}

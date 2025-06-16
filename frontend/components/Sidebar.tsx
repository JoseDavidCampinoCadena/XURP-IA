'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaCalendar, FaTasks, FaBook, FaProjectDiagram, FaCog } from 'react-icons/fa';

interface NavLink {
  href?: string;
  icon?: React.ReactNode;
  text?: string;
  type?: 'divider';
}

export default function Sidebar({ userGroups }: { userGroups: string[] }) {
  const pathname = usePathname();

  const links: NavLink[] = [
    { href: '/home', icon: <FaHome className="w-5 h-5" />, text: 'Home' },
    { href: '/home/calendar', icon: <FaCalendar className="w-5 h-5" />, text: 'Mi Calendario' },
    { href: '/home/tasks', icon: <FaTasks className="w-5 h-5" />, text: 'Mis Tareas' },
    { href: '/home/notes', icon: <FaBook className="w-5 h-5" />, text: 'Notas' },
    { href: '/home/ia', icon: <FaProjectDiagram className="w-5 h-5" />, text: 'IA' },
    { type: 'divider' },
    { href: '/home/settings/profile', icon: <FaCog className="w-5 h-5" />, text: 'Configuración' },
  ];

  return (
    <div className="w-64 min-h-screen bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-700 p-4">
      {/* Título */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          XURP<span className="text-green-500"> IA</span>
        </h1>
      </div>
      
      {/* Navegación */}
      <nav className="space-y-2">
        {links.map((link, index) => {
          if (link.type === 'divider') {
            return <hr key={index} className="my-4 border-gray-200 dark:border-zinc-700" />;
          }
          
          if (!link.href) return null;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === link.href
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.icon}
              <span>{link.text}</span>
            </Link>
          );
        })}
      </nav>

      
    </div>
  );
}
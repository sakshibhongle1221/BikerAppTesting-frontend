"use client";
import { ClientPageRoot } from "next/dist/client/components/client-page";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname() || "/";

  const items = [
    { href: "/", label: "Profile", icon: UserIcon },
    { href: "/about", label: "About", icon: InfoIcon },
    { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 text-white z-50">
      <div className="max-w-3xl mx-auto px-2">
        <div className="flex justify-between items-center h-16">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex-1 flex flex-col items-center justify-center text-xs py-1 ${
                  active ? "text-green-400" : "text-gray-300"
                }`}
              >
                <it.icon active={active} />
                <span className="mt-1">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}


function UserIcon({ active }) {
  return (
    <svg
      className={`w-6 h-6 ${active ? "text-green-400" : "text-gray-300"}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 20a6 6 0 0 0-12 0" />
      <circle cx="12" cy="10" r="4" />
    </svg>
  );
}


function InfoIcon({ active }) {
  return (
    <svg
      className={`w-6 h-6 ${active ? "text-green-400" : "text-gray-300"}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
      <line x1="12" y1="12" x2="12" y2="16" />
    </svg>
  );
}


function CalendarIcon({ active }) {
  return (
    <svg
      className={`w-6 h-6 ${active ? "text-green-400" : "text-gray-300"}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

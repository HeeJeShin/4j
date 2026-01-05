import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    return (
        <header className="w-full border-b border-zinc-200 bg-gradient-to-r from-white via-orange-50/30 to-white shadow-sm">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
            <Link
              href="/"
              className="flex items-center gap-3 hover:scale-105 transition-transform duration-200 ease-out"
            >
              <Image
                src="/logo.png"
                alt="ezpmp Logo"
                width={120}
                height={56}
                priority
                className="h-10 w-auto"
              />
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-orange-300 to-transparent"></div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                4J
              </h1>
            </Link>
          </div>
        </header>
    );
}
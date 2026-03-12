'use client';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="backdrop-blur-md bg-[#ff6201]">
        <nav className="flex items-center justify-between max-w-[1440px] mx-auto px-6 py-5">
          {/* Logo */}
          <a
            href="https://anam.ai"
            className="flex items-center"
          >
            <img
              src="/anam-logo-white.svg"
              alt="Anam"
              className="h-6"
            />
          </a>

          {/* Navigation Items */}
          <div className="flex items-center gap-10">
            <a
              href="https://anam.ai/api"
              className="text-white text-[14px] font-medium hover:opacity-80 transition-opacity hidden md:block"
            >
              Developers
            </a>
            <a
              href="https://anam.ai/pricing"
              className="text-white text-[14px] font-medium hover:opacity-80 transition-opacity hidden md:block"
            >
              Pricing
            </a>
            

            <a
              href="https://docs.anam.ai/quickstart"
              className="text-white text-[14px] font-medium hover:opacity-80 transition-opacity hidden md:block"
            >
              Docs Quickstart
            </a>
            {/* Sign in Button */}
            <a
              href="https://lab.anam.ai/login"
              className="px-5 py-2.5 bg-[rgb(245,245,245)] text-black text-[15px] font-medium rounded-full hover:opacity-80 transition-opacity"
            >
              Sign in
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

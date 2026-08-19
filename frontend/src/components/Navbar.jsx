import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <Link
          to="/dashboard"
          className="text-xl font-bold tracking-tight text-slate-900"
        >
          SmartRetail<span className="text-blue-600">X</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-500 sm:block">
            Retail Management Portal
          </span>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            U
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

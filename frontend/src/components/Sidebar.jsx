import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: "⌂" },
  { name: "Products", path: "/products", icon: "▦" },
  { name: "Orders", path: "/orders", icon: "▤" },
];

const adminNavigation = [
  { name: "Inventory", path: "/inventory", icon: "▥" },
  { name: "Users", path: "/users", icon: "♙" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "ADMIN";

  // Close mobile sidebar on route change
  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sidebarContent = (
    <>
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-slate-200" />
            <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin
            </p>
            {adminNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            {user?.name || "User"}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {user?.email || ""}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              isAdmin
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {user?.role || "CUSTOMER"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <span className="text-lg">↪</span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar (always visible on md+) */}
      <aside className="hidden min-h-[calc(100vh-4rem)] w-64 flex-col border-r border-slate-200 bg-white md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile overlay sidebar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={onClose}
          />

          {/* Slide-in panel */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl md:hidden"
            style={{ animation: "slideIn 0.2s ease-out" }}
          >
            {/* Close button */}
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="text-lg font-bold text-slate-900">
                SmartRetail<span className="text-blue-600">X</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {sidebarContent}
          </aside>

          <style>{`
            @keyframes slideIn {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </>
  );
};

export default Sidebar;
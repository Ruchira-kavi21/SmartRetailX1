import { NavLink, useNavigate } from "react-router-dom";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "⌂",
  },
  {
    name: "Products",
    path: "/products",
    icon: "▦",
  },
  {
    name: "Orders",
    path: "/orders",
    icon: "▤",
  },
];

const adminNavigation = [
  {
    name: "Inventory",
    path: "/inventory",
    icon: "▥",
  },
  {
    name: "Users",
    path: "/users",
    icon: "♙",
  },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <aside className="hidden min-h-[calc(100vh-4rem)] w-64 flex-col border-r border-slate-200 bg-white md:flex">
      
      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">

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
            <span className="text-lg">
              {item.icon}
            </span>

            {item.name}
          </NavLink>
        ))}

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <div className="my-4 border-t border-slate-200" />

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
                <span className="text-lg">
                  {item.icon}
                </span>

                {item.name}
              </NavLink>
            ))}
          </>
        )}

      </nav>

      {/* User Section */}
      <div className="border-t border-slate-200 p-4">

        {/* User Card */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            {user?.name || "User"}
          </p>

          <p className="mt-1 truncate text-xs text-slate-500">
            {user?.email || ""}
          </p>

          <span className="mt-2 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {user?.role || "CUSTOMER"}
          </span>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <span className="text-lg">
            ↪
          </span>

          Logout
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;
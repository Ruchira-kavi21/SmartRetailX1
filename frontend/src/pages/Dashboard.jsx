import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import { getOrders } from "../services/orderService";
import { getInventory } from "../services/inventoryService";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "ADMIN";

  const [stats, setStats] = useState({
    products: null,
    orders: null,
    inventory: null,
    recentOrders: [],
    topProducts: [],
    lowStock: [],
    revenue: 0,
    pendingOrders: 0,
    myOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        const [productsRes, ordersRes] = await Promise.allSettled([
          getProducts(),
          getOrders(),
        ]);

        const products =
          productsRes.status === "fulfilled"
            ? productsRes.value.data || []
            : [];
        const orders =
          ordersRes.status === "fulfilled"
            ? ordersRes.value.data || []
            : [];

        let inventoryItems = [];
        if (isAdmin) {
          try {
            const invRes = await getInventory();
            inventoryItems = invRes.data || [];
          } catch {}
        }

        const pendingOrders = orders.filter(
          (o) => o.status === "PENDING"
        ).length;
        const confirmedOrders = orders.filter(
          (o) => o.status === "CONFIRMED"
        );
        const revenue = confirmedOrders.reduce(
          (sum, o) => sum + Number(o.totalAmount || 0),
          0
        );
        const myOrders = orders.filter(
          (o) => o.userId === user?.id
        ).length;

        const lowStock = inventoryItems.filter(
          (i) => i.quantity - i.reserved < 10
        );

        setStats({
          products: products.length,
          orders: orders.length,
          inventory: inventoryItems.length,
          recentOrders: orders.slice(0, 5),
          topProducts: products.slice(0, 5),
          lowStock,
          revenue,
          pendingOrders,
          myOrders,
        });
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-blue-600">
          {isAdmin ? "Admin Dashboard" : "My Dashboard"}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, {user?.name?.split(" ")[0] || "User"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isAdmin
            ? "Full system overview — products, orders, inventory & users."
            : "Track your orders and browse products."}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Products"
          value={stats.products ?? "—"}
          desc="In catalogue"
          color="blue"
          link="/products"
        />
        <StatCard
          title={isAdmin ? "Total Orders" : "My Orders"}
          value={isAdmin ? stats.orders ?? "—" : stats.myOrders}
          desc={
            isAdmin
              ? `${stats.pendingOrders} pending`
              : "Orders placed"
          }
          color="emerald"
          link="/orders"
        />
        {isAdmin && (
          <>
            <StatCard
              title="Inventory"
              value={stats.inventory ?? "—"}
              desc={`${stats.lowStock.length} low stock`}
              color="amber"
              link="/inventory"
            />
            <StatCard
              title="Revenue"
              value={`$${stats.revenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              desc="From confirmed orders"
              color="violet"
            />
          </>
        )}
        {!isAdmin && (
          <StatCard
            title="Pending"
            value={stats.pendingOrders}
            desc="Awaiting confirmation"
            color="amber"
            link="/orders"
          />
        )}
      </div>

      {/* Body grid */}
      <div
        className={`grid gap-6 ${
          isAdmin ? "lg:grid-cols-2" : "lg:grid-cols-1"
        }`}
      >
        {/* Recent orders */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Orders
            </h2>
            <Link
              to="/orders"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-400">
              No orders yet
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty: {order.quantity} ·{" "}
                      ${Number(order.totalAmount).toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      order.status === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin: low stock alerts */}
        {isAdmin && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Low Stock Alerts
              </h2>
              <Link
                to="/inventory"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Manage →
              </Link>
            </div>

            {stats.lowStock.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">
                All stock levels healthy ✓
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.lowStock.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-6 py-3"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      Product #{item.productId}
                    </p>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        {item.quantity - item.reserved} available
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.reserved} reserved
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customer: quick links */}
        {!isAdmin && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Quick Actions
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                to="/products"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg text-blue-600">
                  ▦
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Browse Products
                  </p>
                  <p className="text-xs text-slate-500">
                    View catalogue
                  </p>
                </div>
              </Link>
              <Link
                to="/orders"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-lg text-emerald-600">
                  ▤
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    My Orders
                  </p>
                  <p className="text-xs text-slate-500">
                    Track deliveries
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Products table (admin) */}
      {isAdmin && stats.topProducts.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Products Overview
            </h2>
            <Link
              to="/products"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.topProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-6 py-3 font-medium text-slate-900">
                      {p.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-slate-500">
                      {p.sku}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-slate-500">
                      {p.category}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-right text-slate-900">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-right">
                      <span
                        className={`font-medium ${
                          p.stock < 10
                            ? "text-red-600"
                            : "text-slate-900"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, desc, color, link }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };

  const content = (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
            colors[color] || colors.blue
          }`}
        >
          {String(value).charAt(0)}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{desc}</p>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
};

export default Dashboard;

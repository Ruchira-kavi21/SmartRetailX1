const Dashboard = () => {
  const stats = [
    {
      title: "Products",
      value: "—",
      description: "Products in catalogue",
    },
    {
      title: "Orders",
      value: "—",
      description: "Total orders",
    },
    {
      title: "Inventory",
      value: "—",
      description: "Inventory records",
    },
    {
      title: "System Status",
      value: "Healthy",
      description: "Microservices availability",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600">SmartRetailX</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor products, orders and inventory from one place.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{stat.title}</p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {stat.value}
            </p>

            <p className="mt-2 text-sm text-slate-500">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          System Overview
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          SmartRetailX is powered by independent microservices for
          authentication, products, orders and inventory.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

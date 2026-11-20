
import { Link } from "react-router-dom";

function AdminDashboard() {
  const cards = [
    {
      title: "Manage Users",
      description: "Create and manage customer accounts.",
      link: "/admin/users",
      button: "View Users",
    },
    {
      title: "Investment Plans",
      description: "Create and manage investment packages.",
      link: "/admin/investment-plans",
      button: "View Plans",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">
        Admin Dashboard
      </h1>

      <p className="text-slate-500 mt-2">
        Manage users and investment plans from here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-slate-800">
              {card.title}
            </h2>

            <p className="text-slate-500 mt-3">
              {card.description}
            </p>

            <Link
              to={card.link}
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              {card.button}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;

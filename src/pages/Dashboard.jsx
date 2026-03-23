import { alerts } from "../data/dummyAlerts";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">🚨 NOC Alerts Dashboard</h1>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-gray-800 p-4 rounded-xl shadow hover:bg-gray-700 cursor-pointer"
            onClick={() => navigate(`/simulator/${alert.id}`)}
          >
            <h2 className="text-xl font-semibold">{alert.title}</h2>
            <p>{alert.description}</p>
            <span
              className={`text-sm ${
                alert.severity === "Critical"
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              {alert.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
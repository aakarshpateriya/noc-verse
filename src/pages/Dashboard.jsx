import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-3xl mb-6">🚨 Alerts Dashboard</h1>

      <div
        className="bg-gray-800 p-4 rounded-xl cursor-pointer"
        onClick={() => navigate("/simulator/1")}
      >
        Disk Utilization High
      </div>
    </div>
  );
}

export default Dashboard;
import { useParams } from "react-router-dom";
import Terminal from "../components/Terminal";

function Simulator() {
  const { id } = useParams();

  return (
    <div className="bg-gray-900 min-h-screen p-6 text-white">
      <h1 className="text-2xl mb-4">🖥️ Alert Simulator #{id}</h1>

      <Terminal />
    </div>
  );
}

export default Simulator;
import { useParams } from "react-router-dom";
import Terminal from "../components/Terminal";
import { alertScenarios } from "../data/alertScenarios";

function Simulator() {
  const { id } = useParams();

  const scenario = alertScenarios[id];

  if (!scenario) {
    return <div>Alert not found</div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen p-6 text-white">
      <h1 className="text-2xl mb-4">{scenario.name}</h1>

      <Terminal scenario={scenario} />
    </div>
  );
}

export default Simulator;
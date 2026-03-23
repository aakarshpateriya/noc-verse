import { useParams } from "react-router-dom";
import Terminal from "../components/Terminal";
import SOPPanel from "../components/SOPPanel";
import { alertScenarios } from "../data/alertScenarios";

function Simulator() {
  const { id } = useParams();

  const scenario = alertScenarios[id];

  if (!scenario) {
    return <div className="text-white p-6">Alert not found</div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen p-6 text-white">
      <h1 className="text-2xl mb-4">{scenario.name}</h1>

      <div className="grid grid-cols-3 gap-4">
        {/* Terminal */}
        <div className="col-span-2">
          <Terminal scenario={scenario} />
        </div>

        {/* SOP */}
        <SOPPanel sop={scenario.sop} />
      </div>
    </div>
  );
}

export default Simulator;
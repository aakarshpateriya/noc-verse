function SOPPanel({ sop }) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl h-[80vh] overflow-y-auto text-white">
      <h2 className="text-xl mb-4">📘 SOP Guide</h2>

      <ul className="list-disc ml-4 space-y-2">
        {sop.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
    </div>
  );
}

export default SOPPanel;
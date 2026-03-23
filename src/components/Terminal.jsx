import { useState } from "react";

function Terminal({ scenario }) {
  const [history, setHistory] = useState([
    { type: "output", text: "Connected to VM..." },
  ]);

  const [input, setInput] = useState("");

  const [state, setState] = useState({ ...scenario.state });

  const [isResolved, setIsResolved] = useState(false);

  // 🔹 Command handler
  const handleCommand = (cmd) => {
    const commandFunc = scenario.commands[cmd];

    if (commandFunc) {
      const result = commandFunc(state);
      setState({ ...state }); // update state
      return result;
    }

    return `Command not found: ${cmd}`;
  };

  // 🔹 On command submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isResolved) return;

    const output = handleCommand(input);

    let newHistory = [
      ...history,
      { type: "input", text: input },
      { type: "output", text: output },
    ];

    // 🔥 Check if alert resolved
    if (scenario.validate(state)) {
      newHistory.push({
        type: "output",
        text: "✅ Alert Resolved Successfully!",
      });
      setIsResolved(true);
    }

    setHistory(newHistory);
    setInput("");
  };

  return (
    <div className="bg-black text-green-400 h-[80vh] p-4 font-mono rounded-xl overflow-y-auto">
      {history.map((item, index) => (
        <div key={index}>
          {item.type === "input" ? (
            <p>
              <span className="text-blue-400">$</span> {item.text}
            </p>
          ) : (
            <p>{item.text}</p>
          )}
        </div>
      ))}

      {!isResolved && (
        <form onSubmit={handleSubmit} className="mt-2">
          <span className="text-blue-400">$ </span>
          <input
            className="bg-black outline-none text-green-400 w-[90%]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
        </form>
      )}
    </div>
  );
}

export default Terminal;
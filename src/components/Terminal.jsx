import { useState } from "react";

function Terminal() {
  const [history, setHistory] = useState([
    { type: "output", text: "Welcome to NOC VM" },
  ]);
  const [input, setInput] = useState("");

  // Command handler
  const handleCommand = (cmd) => {
    let output = "";

    switch (cmd.trim()) {
      case "df -h":
        output = "/dev/sda1   95% used";
        break;
      case "free -m":
        output = "Memory: 80% used";
        break;
      case "ls":
        output = "log1.log log2.log large.log";
        break;
      case "help":
        output = "Try commands like df -h, free -m, ls";
        break;
      default:
        output = `Command not found: ${cmd}`;
    }

    return output;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const output = handleCommand(input);

    setHistory([
      ...history,
      { type: "input", text: input },
      { type: "output", text: output },
    ]);

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

      <form onSubmit={handleSubmit} className="mt-2">
        <span className="text-blue-400">$ </span>
        <input
          className="bg-black outline-none text-green-400 w-[90%]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
      </form>
    </div>
  );
}

export default Terminal;
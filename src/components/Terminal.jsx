import { useEffect, useMemo, useRef, useState } from "react";
import { getAIHelp } from "../services/api";

function Terminal({ scenario }) {
  const validCommands = useMemo(() => Object.keys(scenario.commands), [scenario]);

  const [history, setHistory] = useState([
    { type: "output", text: "Connected to VM..." },
    {
      type: "output",
      text: `🚨 Alert: ${scenario.name}\nType a command to investigate. Type "help" if you want AI coaching.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [state, setState] = useState({ ...scenario.state });
  const [isResolved, setIsResolved] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [score, setScore] = useState(100);
  const [aiStatus, setAiStatus] = useState({
    nextStep: "Start by investigating the alert with a safe diagnostic command.",
    expectedOutput:
      "The terminal should show evidence that helps you understand the problem.",
    evaluation: "progressing",
  });
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const requestAIReview = async ({
    command,
    output,
    nextState,
    nextHistory,
    nextMistakeCount,
    resolved,
  }) => {
    const aiResponse = await getAIHelp({
      command,
      output,
      state: nextState,
      alertName: scenario.name,
      sop: scenario.sop,
      history: nextHistory,
      validCommands,
      errorCount: nextMistakeCount,
      isResolved: resolved,
    });

    const aiReply = aiResponse?.reply || "AI could not generate guidance.";
    const nextStep =
      aiResponse?.nextStep ||
      "Review the last result and choose the next troubleshooting command.";
    const expectedOutput =
      aiResponse?.expectedOutput ||
      "You should see output that helps confirm the next action.";
    const evaluation = aiResponse?.evaluation || "progressing";
    const updatedScore =
      typeof aiResponse?.score === "number"
        ? aiResponse.score
        : Math.max(0, 100 - nextMistakeCount * 10);

    setAiStatus({
      nextStep,
      expectedOutput,
      evaluation,
    });
    setScore(updatedScore);

    return [
      {
        type: "output",
        text: `🤖 AI Coach\n${aiReply}`,
      },
      {
        type: "output",
        text: `➡️ Next Step: ${nextStep}`,
      },
      {
        type: "output",
        text: `👀 Expected Output: ${expectedOutput}`,
      },
      {
        type: "output",
        text: `🏆 Score: ${updatedScore}/100 | ❌ Mistakes: ${nextMistakeCount}`,
      },
    ];
  };

  const handleCommand = async (cmd) => {
    const trimmed = cmd.trim();

    if (!trimmed) {
      return {
        output: "Please enter a command.",
        nextState: state,
        isMistake: false,
      };
    }

    if (trimmed === "help") {
      return {
        output:
          "🧠 AI is analyzing the alert, your previous commands, and the latest system behavior to generate the best next move...",
        nextState: state,
        isMistake: false,
        forceAI: true,
      };
    }

    const commandFunc = scenario.commands[trimmed];

    if (commandFunc) {
      const updatedState = { ...state };
      const result = commandFunc(updatedState);

      return {
        output: result,
        nextState: updatedState,
        isMistake: false,
      };
    }

    return {
      output: `Command not found: ${trimmed}`,
      nextState: state,
      isMistake: true,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isResolved) return;

    const currentInput = input.trim();
    if (!currentInput) return;

    const commandResult = await handleCommand(currentInput);
    const resolved = scenario.validate(commandResult.nextState);
    const nextMistakeCount = commandResult.isMistake
      ? mistakeCount + 1
      : mistakeCount;

    setState(commandResult.nextState);
    setMistakeCount(nextMistakeCount);

    let newHistory = [
      ...history,
      { type: "input", text: currentInput },
      { type: "output", text: commandResult.output },
    ];

    const aiMessages = await requestAIReview({
      command: currentInput,
      output: commandResult.output,
      nextState: commandResult.nextState,
      nextHistory: newHistory,
      nextMistakeCount,
      resolved,
    });

    newHistory = [...newHistory, ...aiMessages];

    if (resolved) {
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
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-green-900 px-3 py-1 text-green-300">
          Score: {score}/100
        </span>
        <span className="rounded-full bg-red-900 px-3 py-1 text-red-300">
          Mistakes: {mistakeCount}
        </span>
        <span className="rounded-full bg-blue-900 px-3 py-1 text-blue-300">
          Status: {aiStatus.evaluation}
        </span>
      </div>

      {history.map((item, index) => (
        <div key={index} className="mb-2 whitespace-pre-wrap">
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

      <div ref={terminalEndRef} />
    </div>
  );
}

export default Terminal;

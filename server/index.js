import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Bytez from "bytez.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "config.env") });

const app = express();

const allowedOrigin =
  process.env.FRONTEND_URL ||
  process.env.VITE_REACT_APP_URL ||
  process.env.Vite_react_app_URL;

app.use(
  cors({
    origin: allowedOrigin ? [allowedOrigin, "http://localhost:5173"] : true,
  })
);
app.use(express.json());

const bytezApiKey = process.env.BYTEZ_API_KEY || process.env.OPENAI_API_KEY;
const sdk = bytezApiKey ? new Bytez(bytezApiKey) : null;
const model = sdk ? sdk.model("google/gemma-4-26B-A4B-it") : null;

const scoreFromErrors = (errorCount = 0) => Math.max(0, 100 - errorCount * 10);

const buildFallbackReply = ({
  command,
  state,
  alertName,
  errorCount = 0,
  validCommands = [],
  history = [],
  isResolved = false,
}) => {
  const normalizedCommand = (command || "").trim().toLowerCase();
  const score = scoreFromErrors(errorCount);
  const recentHistory = history.slice(-4).map((item) => `${item.type}: ${item.text}`);

  if (isResolved) {
    return {
      reply: `🎉 Nice work — you resolved the alert.

You stayed hands-on with the investigation and completed the scenario.
Example wrap-up command:
\`\`\`bash
df -h
ls -lh /var/log
\`\`\`

Final score: ${score}/100
Mistakes counted: ${errorCount}`,
      nextStep: "Review the commands that fixed the issue and explain why they worked.",
      expectedOutput:
        "Disk usage should be reduced and the noisy log file should no longer be blocking the system.",
      score,
      mistakeCount: errorCount,
      evaluation: "resolved",
      fallback: true,
    };
  }

  return {
    reply: `🚀 AI Coach is running in fallback mode because BYTEZ_API_KEY is not configured.

I reviewed the latest command and simulator state. Focus on the next diagnostic step before changing anything.
Example command:
\`\`\`bash
${validCommands[0] || "df -h"}
${validCommands[1] || "ls"}
\`\`\`

Current score: ${score}/100
Mistakes counted so far: ${errorCount}`,
    nextStep: normalizedCommand
      ? `Review the result of "${command}" and compare it with the alert symptoms before choosing the next command.`
      : "Start with a safe diagnostic command to understand the alert before making changes.",
    expectedOutput:
      recentHistory[recentHistory.length - 1] ||
      "You should see evidence that helps you identify the next troubleshooting action.",
    score,
    mistakeCount: errorCount,
    evaluation: validCommands.includes(command) ? "progressing" : "needs-correction",
    fallback: true,
  };
};

app.post("/ai-help", async (req, res) => {
  try {
    const {
      command,
      output,
      state,
      alertName,
      sop = [],
      history = [],
      validCommands = [],
      errorCount = 0,
      isResolved = false,
    } = req.body;

    if (!model) {
      return res.json(
        buildFallbackReply({
          command,
          state,
          alertName,
          errorCount,
          validCommands,
          history,
          isResolved,
        })
      );
    }

    const { error, output: aiOutput } = await model.run([
      {
        role: "system",
        content: `You are an advanced senior NOC incident commander AI inside an interactive troubleshooting simulator.

Your job:
- Deeply understand the alert, the latest command, the terminal output, the full command history, the SOP, and the simulator state.
- Infer what the user is trying to do, whether the last step was useful, and what the best next action should be.
- Guide the user step by step for the NEXT action only.
- Monitor mistakes based on the errorCount provided by the app.
- Give a score based on mistakes. Start from 100 and subtract 10 for each mistake.
- The score must be included in every response and especially in the final resolution response.

Output requirements:
- Respond ONLY as valid JSON.
- Use this exact schema:
{
  "reply": "string",
  "nextStep": "string",
  "expectedOutput": "string",
  "score": number,
  "mistakeCount": number,
  "evaluation": "progressing|needs-correction|resolved"
}

Content rules:
- "reply" must contain at least 2 short helpful lines.
- "reply" must sound expert, practical, and context-aware.
- "reply" must include a small example command/code block for the next step.
- When the latest command is "help", explain the current problem clearly, summarize what has been learned so far, and tell the user the smartest next move.
- "nextStep" must explain exactly what to do next.
- "expectedOutput" must describe what the user should expect to observe after the next step, based on the scenario context.
- If the issue is resolved, praise the user and include the final score.
- Be concise but high-value, like a real incident response mentor.
- Do not provide the full solution immediately unless the scenario is already resolved.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          alertName,
          latestCommand: command,
          latestOutput: output,
          currentState: state,
          sop,
          history,
          validCommands,
          errorCount,
          isResolved,
          scoringRule: "score = max(0, 100 - errorCount * 10)",
          task:
            "Analyze the situation, understand the problem, and provide the next step with example code/command. If the latest command is help, give a high-quality explanation of the current problem, summarize the evidence from history, and recommend the smartest next action. Also provide the expected next output and score.",
        }),
      },
    ]);

    if (error) {
      throw new Error(typeof error === "string" ? error : JSON.stringify(error));
    }

    const rawReply =
      typeof aiOutput === "string"
        ? aiOutput
        : aiOutput?.text ||
          aiOutput?.content ||
          aiOutput?.output ||
          JSON.stringify(aiOutput);

    let parsed;
    try {
      parsed = JSON.parse(rawReply);
    } catch {
      parsed = {
        reply: rawReply,
        nextStep: "Follow the guidance above and run the suggested diagnostic command.",
        expectedOutput:
          "You should see output that helps confirm the root cause or the next troubleshooting direction.",
        score: scoreFromErrors(errorCount),
        mistakeCount: errorCount,
        evaluation: isResolved ? "resolved" : "progressing",
      };
    }

    res.json({
      reply: parsed.reply,
      nextStep: parsed.nextStep,
      expectedOutput: parsed.expectedOutput,
      score:
        typeof parsed.score === "number" ? parsed.score : scoreFromErrors(errorCount),
      mistakeCount:
        typeof parsed.mistakeCount === "number" ? parsed.mistakeCount : errorCount,
      evaluation: parsed.evaluation || (isResolved ? "resolved" : "progressing"),
      fallback: false,
    });
  } catch (err) {
    console.error("AI help failed:", err?.message || err);
    res.status(500).json({
      error: err?.message || "AI failed",
    });
  }
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});

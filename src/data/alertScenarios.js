export const alertScenarios = {
  1: {
    name: "Disk Utilization High",

    // 🔹 Initial VM State
    state: {
      diskUsage: 95,
      logsPresent: true,
    },

    // 🔹 Commands simulation
    commands: {
      "df -h": (state) => `/dev/sda1   ${state.diskUsage}% used`,

      "cd /var/log": () => "Moved to /var/log",

      ls: (state) =>
        state.logsPresent ? "huge.log other.log" : "other.log",

      "rm huge.log": (state) => {
        if (state.logsPresent) {
          state.logsPresent = false;
          state.diskUsage = 60;
          return "huge.log deleted";
        }
        return "No such file";
      },
    },

    // 🔹 Validation Logic
    validate: (state) => state.diskUsage < 70,

    // 🔹 SOP Steps
    sop: [
      "Check disk usage using df -h",
      "Navigate to /var/log",
      "Identify large files",
      "Delete unnecessary logs",
    ],
  },
};
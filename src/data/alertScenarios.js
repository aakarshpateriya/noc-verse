export const alertScenarios = {
  1: {
    name: "Disk Utilization High",
    state: {
      diskUsage: 95,
      logsPresent: true,
    },
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
    solution: ["df -h", "cd /var/log", "rm huge.log"],
  },
};
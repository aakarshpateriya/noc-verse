export const alertScenarios = {
  1: {
    name: "Disk Utilization High",

    state: {
      diskUsage: 95,
      logsPresent: true,
    },

    commands: {
      "df -h": (state) => `Filesystem      Size  Used Avail Use% Mounted on
udev            1.9G     0  1.9G   0% /dev
tmpfs           393M  1.6M  391M   1% /run
/dev/sda1        40G   38G  2.0G  ${state.diskUsage}% /
tmpfs           2.0G     0  2.0G   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
/dev/sda15      105M  6.1M   99M   6% /boot/efi
tmpfs           393M  4.0K  393M   1% /run/user/1000`,

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

    validate: (state) => state.diskUsage < 70,

    sop: [
      "Check disk usage using df -h",
      "Navigate to /var/log",
      "Identify large files",
      "Delete unnecessary logs",
    ],
  },
};

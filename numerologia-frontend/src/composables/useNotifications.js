import { Notify } from "quasar";

const notificationConfig = {
  success: {
    timeout: 3000,
    icon: "check_circle",
    class: "cosmic-notify--success",
  },
  error: { timeout: 4000, icon: "error", class: "cosmic-notify--error" },
  warning: { timeout: 3500, icon: "warning", class: "cosmic-notify--warning" },
  info: { timeout: 3000, icon: "auto_awesome", class: "cosmic-notify--info" },
};

export function useNotifications() {
  const notify = (type, message, caption = "") => {
    const config = notificationConfig[type];
    Notify.create({
      message,
      caption,
      position: "top",
      timeout: config.timeout,
      icon: config.icon,
      classes: `cosmic-notify ${config.class}`,
      actions: [
        {
          icon: "close",
          color: "white",
          flat: true,
          round: true,
        },
      ],
      html: true,
    });
  };

  return {
    success: (msg, cap) => notify("success", msg, cap),
    error: (msg, cap) => notify("error", msg, cap),
    warning: (msg, cap) => notify("warning", msg, cap),
    info: (msg, cap) => notify("info", msg, cap),
  };
}

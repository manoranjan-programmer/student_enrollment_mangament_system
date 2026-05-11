import React, { useEffect } from "react";

const Toast = ({ message, onClose, duration = 2500 }) => {
  useEffect(() => {
    if (!message || !onClose) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  return message ? <div className="toast">{message}</div> : null;
};

export default Toast;

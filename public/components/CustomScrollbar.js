import { useEffect } from "react";

function CustomScrollbar() {
  useEffect(() => {
    document.documentElement.classList.add("custom-scrollbars-enabled");
    return () => {
      document.documentElement.classList.remove("custom-scrollbars-enabled");
    };
  }, []);
  return null;
}

export default CustomScrollbar;

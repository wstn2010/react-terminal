import * as React from "react";
import { isMobile } from "react-device-detect";

export const useClickOutsideEvent = (ref: any, clickedInside: boolean, setClickedInside: any) => {
  const handleClickOutside = (event: any) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setClickedInside(false);
    } else if (isMobile) {
        setClickedInside(!clickedInside);
    } else {
      setClickedInside(true);
    }
  };

  function blurHandler(this: Window, event: FocusEvent): any {
    setClickedInside(false);
  }

  React.useEffect(() => {
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener('blur', blurHandler);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("blur", blurHandler);
    };
  });
};

export default {
  useClickOutsideEvent
};

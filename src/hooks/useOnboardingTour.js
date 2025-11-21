import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "../styles/driver-dark.css"


export default function useOnboardingTour() {
  const hasRunRef = useRef(false);
  // Cross-browser storage getter/setter
  const storage = {
    get(key) {
      return new Promise((resolve) => {
        if (window.browser?.storage?.local) {
          browser.storage.local.get(key).then(resolve);
        } else if (window.chrome?.storage?.local) {
          chrome.storage.local.get(key, resolve);
        } else {
          resolve({}); // fallback
        }
      });
    },
    set(obj) {
      if (window.browser?.storage?.local) {
        return browser.storage.local.set(obj);
      }
      if (window.chrome?.storage?.local) {
        return chrome.storage.local.set(obj);
      }
    }
  };


  // -----------------------------------------
  // Define steps once
  // -----------------------------------------
  const steps = [
    {
      element: "#lock-btn",
      clickSelector: "#lock-btn",
      popover: {
        title: "Lock Icon",
        description:
          "Welcome! Tap this button to lock or unlock your dashboard. When unlocked, you can easily add or remove images, upload PDFs, and access even more personalization options.",
      },
    },
    {
      element: "#customize-btn",
      popover: {
        title: "Customization",
        description:
          "Want to make your dashboard yours? Turn on customization to edit things like the date, to-do list, countdowns, and your app bar. It’s your space—make it perfect for you!",
      },
      preHighlight: () =>
        new Promise((resolve) => {
          setTimeout(resolve, 1000);
        }),
    },
    {
      element: "#setting-btn",
      clickSelector: "#setting-btn",
      popover: {
        title: "Settings",
        description:
          "Go to settings to change appearance, preferences, and tab behavior.",
      },
    },
    {
      element: "#General-btn",
      popover: {
        title: "General",
        description:
          "Manage basic options. Add, remove, or edit features you want as needed.",
      },
      onHighlighted: () => {
        document.querySelector("#General-btn")?.click();
      }

    },
    {
      element: "#Wallpaper-btn",
      popover: {
        title: "Wallpaper",
        description:
          "Select and customize your wallpaper.",
      },
      onHighlighted: () => {
        document.querySelector("#Wallpaper-btn")?.click();
      }
    },
    {
      element: "#Study-btn",
      clickSelector: "#Study-btn",
      popover: {
        title: "Study",
        description:
          "Set up countdown timers and study tracking tools.",
      },
      onHighlighted: () => {
        document.querySelector("#Study-btn")?.click();
      }
    },
  ];

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    // -----------------------------------------
    // START TOUR
    // -----------------------------------------
    const startTour = () => {
      const tour = driver({
        animate: true,
        allowClose: false,
        overlayOpacity: 0.75,
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        steps,

        // ==========================================
        // ⭐ FIXED onNextClick (fully working)
        // ==========================================
        onNextClick: (element, step, { driver: drv }) => {
          // click real button if needed
          if (step?.clickSelector) {
            const target = document.querySelector(step.clickSelector);
            target?.click();
          }

          const isLast = !drv.hasNextStep();

          // ⏳ delay rules for specific steps
          const delaySteps = ["#lock-btn", "#General-btn", "#Wallpaper-btn", "#Study-btn"];

          if (delaySteps.includes(step?.clickSelector)) {
            const delay = step.clickSelector === "#lock-btn" ? 40 : 100;

            setTimeout(() => {
              if (isLast) drv.destroy?.();
              else drv.moveNext();
            }, delay);

            return; // important!
          }

          // default: next or destroy
          if (isLast) {
            drv.destroy?.();
          } else {
            drv.moveNext();
          }
        },
      });

      tour.drive();
    };

    storage.get("hasSeenTour").then((res) => {
      if (!res?.hasSeenTour) {
        startTour();
        storage.set({ hasSeenTour: true });
      }
    });
  }, []);
}

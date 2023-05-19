"use client";

// Stop gap based on
// https://github.com/vercel/next.js/discussions/41745#discussioncomment-4237963
// until router events are implemented

import NProgress, { set } from "nprogress";
import { useEffect, useState } from "react";

const PROGRESS_DELAY_MS = 200;
let TIMEOUT_ID: NodeJS.Timeout | null = null;

NProgress.configure({
  showSpinner: false,
});

type PushStateInput = [
  data: any,
  unused: string,
  url?: string | URL | null | undefined
];

export default function NavigationProgress() {
  const height = "2px";
  const color = "hsl(var(--p))";

  const styles = (
    <style>
      {`
        #nprogress {
          pointer-events: none;
        }
        #nprogress .bar {
          background: ${color};
          position: fixed;
          z-index: 99999;
          top: 0;
          left: 0;
          width: 100%;
          height: ${typeof height === `string` ? height : `${height}px`};
        }
        /* Fancy blur effect */
        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px ${color}, 0 0 5px ${color};
          opacity: 1.0;
          -webkit-transform: rotate(3deg) translate(0px, -4px);
              -ms-transform: rotate(3deg) translate(0px, -4px);
                  transform: rotate(3deg) translate(0px, -4px);
        }
    `}
    </style>
  );

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      // check if this is a ctrl/cmd click
      if (event.metaKey || event.ctrlKey) {
        return;
      }
      const targetUrl = (event.currentTarget as HTMLAnchorElement).href;
      const currentUrl = location.href;
      if (targetUrl !== currentUrl) {
        TIMEOUT_ID = setTimeout(() => {
          NProgress.start();
        }, 200);
      }
    };

    const handleMutation: MutationCallback = () => {
      const anchorElements = document.querySelectorAll("a");
      anchorElements.forEach((anchor) => {
        // check if the click is opening in a new tab
        if (
          anchor.target === "_blank" ||
          anchor.hasAttribute("download") ||
          anchor.hasAttribute("rel")
        ) {
          return;
        }
        anchor.addEventListener("click", handleAnchorClick);
      });
    };

    const mutationObserver = new MutationObserver(handleMutation);
    mutationObserver.observe(document, { childList: true, subtree: true });

    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray: PushStateInput) => {
        NProgress.done();
        if (TIMEOUT_ID) {
          clearTimeout(TIMEOUT_ID);
          TIMEOUT_ID = null;
        }
        return target.apply(thisArg, argArray);
      },
    });
  });

  return styles;
}

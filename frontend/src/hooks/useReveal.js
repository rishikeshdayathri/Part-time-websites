import { useEffect, useRef } from "react";

/**
 * Adds `.is-visible` to elements with the `.sn-reveal` class when they
 * enter the viewport. One-shot (disconnects per element once revealed).
 */
export default function useReveal(deps = []) {
  const rootRef = useRef(null);

  useEffect(() => {
    const scope = rootRef.current || document;
    const els = scope.querySelectorAll(".sn-reveal");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return rootRef;
}

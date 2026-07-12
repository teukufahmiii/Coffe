import { useState, useEffect, useRef } from "react";

export function useScrollSpy(ids: string[], offset: number = 0) {
  const [activeId, setActiveId] = useState<string>(ids[0] || "semua");
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Determine the root margin to adjust when the section is considered active
    // We add an offset to account for sticky headers.
    const rootMargin = `-${offset}px 0px -40% 0px`;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id.replace("category-", ""));
          }
        });
      },
      {
        rootMargin,
        threshold: 0,
      }
    );

    ids.forEach((id) => {
      const element = document.getElementById(`category-${id}`);
      if (element) {
        observer.current?.observe(element);
      }
    });

    return () => {
      observer.current?.disconnect();
    };
  }, [ids, offset]);

  // Method to manually scroll and set active ID to avoid intersection jitter during scroll
  const scrollTo = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - offset - 10; // add a little padding
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return { activeId, scrollTo };
}

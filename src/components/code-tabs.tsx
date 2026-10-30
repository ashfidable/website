import {
  Children,
  isValidElement,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { focusRing } from "./terminal/data";

export function CodeTab({ children }: { label: string; children: ReactNode }) {
  return children;
}

export function CodeTabs({ children }: { children: ReactNode }) {
  const id = useId().replace(/:/g, "");
  const tabs = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => ({
      label: (child.props as { label: string }).label,
      content: (child.props as { children: ReactNode }).children,
    }));
  const [active, setActive] = useState(0);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const next = (active + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  return (
    <div data-code-tabs className="my-5" onKeyDown={onKeyDown}>
      <div data-js-only role="tablist" className="mb-2 flex gap-1 border-b border-site-border">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            id={`${id}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            className={`-mb-px rounded-t-md px-3 py-1 transition-colors ${focusRing} ${
              active === index
                ? "bg-site-heading font-semibold text-site-card"
                : "text-site-muted hover:bg-site-card-hover hover:text-site-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <section
          key={tab.label}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          hidden={active !== index}
          tabIndex={0}
          className={`rounded-md ${focusRing}`}
        >
          <noscript>
            <h3 className="mb-2 mt-4 text-site-heading">{tab.label}</h3>
          </noscript>
          {tab.content}
        </section>
      ))}
    </div>
  );
}

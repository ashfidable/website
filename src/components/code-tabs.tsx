import {
  Children,
  isValidElement,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

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
    <div className="tabs-container" onKeyDown={onKeyDown}>
      <div role="tablist" className="mb-2 flex border-b border-site-border">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            id={`${id}-tab-${index}`}
            role="tab"
            aria-selected={active === index}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            className="px-2 py-1 font-mono aria-selected:border-b aria-selected:border-site-border-hover aria-selected:font-semibold"
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
        >
          {tab.content}
        </section>
      ))}
    </div>
  );
}

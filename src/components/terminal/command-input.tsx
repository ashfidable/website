import { useLayoutEffect, useState, type ComponentProps, type RefObject } from "react";

type CommandInputProps = Omit<ComponentProps<"input">, "ref" | "value"> & {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
};

export function CommandInput({ inputRef, value, ...props }: CommandInputProps) {
  const [caret, setCaret] = useState({ position: 0, scroll: 0, selected: false });

  function syncCaret() {
    const input = inputRef.current;
    if (!input) return;
    const next = {
      position: input.selectionStart ?? value.length,
      scroll: input.scrollLeft,
      selected: input.selectionStart !== input.selectionEnd,
    };
    setCaret((previous) =>
      previous.position === next.position &&
      previous.scroll === next.scroll &&
      previous.selected === next.selected
        ? previous
        : next,
    );
  }

  // Commands can also clear the input without an input or selection event.
  useLayoutEffect(syncCaret, [value]);

  return (
    <span className="terminal-command-input relative min-w-0 flex-1 overflow-hidden text-base md:text-sm">
      <input
        {...props}
        ref={inputRef}
        value={value}
        onSelect={syncCaret}
        onScroll={syncCaret}
        onFocus={syncCaret}
        className="block w-full min-w-0 bg-transparent pr-[1ch] caret-transparent outline-none placeholder:text-site-muted [&::-webkit-search-cancel-button]:hidden"
      />
      <span
        aria-hidden="true"
        className="terminal-command-caret pointer-events-none absolute inset-0 whitespace-pre text-site-heading"
        style={{ transform: `translateX(${-caret.scroll}px)` }}
        hidden={caret.selected}
      >
        <span className="invisible">{value.slice(0, caret.position)}</span>
        <span className="blink inline-block h-[2px] w-[1ch] bg-current align-[-0.12em]" />
      </span>
    </span>
  );
}

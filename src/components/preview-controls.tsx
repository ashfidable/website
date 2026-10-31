import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./icon";
import { focusRing } from "./terminal/data";
import "./preview-controls.css";

/** Toolbar for interactive previews: sliders on the left, icon buttons on the right. */
export function PreviewControls({
  label,
  disabled,
  children,
}: {
  label: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset
      disabled={disabled}
      className="m-0 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 border-0 border-t border-site-border bg-site-card px-3 py-2 text-xs disabled:opacity-50"
    >
      <legend className="sr-only">{label}</legend>
      {children}
    </fieldset>
  );
}

export function PreviewSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const fill = `${((value - min) / (max - min)) * 100}%`;
  return (
    <label className="flex min-w-32 flex-1 items-center gap-2 text-site-muted">
      {label}
      <input
        type="range"
        className={`preview-slider rounded-full ${focusRing}`}
        style={{ "--fill": fill } as CSSProperties}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function PreviewButtons({ children }: { children: ReactNode }) {
  return <div className="ml-auto flex items-center gap-1">{children}</div>;
}

export function PreviewButton({
  icon,
  label,
  pressed,
  disabled,
  onClick,
}: {
  icon: string;
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-8 cursor-pointer place-items-center rounded-md text-base text-site-muted transition-colors hover:bg-site-card-hover hover:text-site-foreground disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-site-muted ${focusRing}`}
    >
      <Icon name={icon} />
    </button>
  );
}

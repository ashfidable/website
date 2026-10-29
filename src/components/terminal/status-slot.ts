import { createContext } from "react";

// Post-owned controls can share their existing state with the persistent status bar.
export const TerminalStatusSlot = createContext<HTMLSpanElement | null>(null);

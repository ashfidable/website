import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { posts, postPath } from "$content/index";
import { useSettings } from "@/providers/settings-provider";
import { Button } from "./button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { links } from "./navigation-links";

type Command = { title: string; emoji: string; category: string; run: () => void };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const settings = useSettings();
  const commands = useMemo<Command[]>(
    () => [
      {
        title: "Toggle Rounded",
        emoji: "⚙️",
        category: "Preferences",
        run: settings.toggleRounded,
      },
      {
        title: "Toggle Dark Theme",
        emoji: "⚙️",
        category: "Preferences",
        run: () => settings.changeTheme("dark"),
      },
      {
        title: "Toggle Light Theme",
        emoji: "⚙️",
        category: "Preferences",
        run: () => settings.changeTheme("light"),
      },
      ...links.map((link) => ({
        title: link.name,
        emoji: "🔗",
        category: "Go To",
        run: () => void navigate({ to: link.url as any }),
      })),
      ...posts.map((post) => ({
        title: post.title,
        emoji: "🔗",
        category: "Posts",
        run: () => void navigate({ to: postPath(post) as any }),
      })),
    ],
    [navigate, settings],
  );

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "/") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);

  const groups = commands.reduce<Record<string, Command[]>>((result, command) => {
    (result[command.category] ??= []).push(command);
    return result;
  }, {});
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <span className="text-site-foreground">Command Palette</span>
        <span className="flex gap-2 rounded-md bg-site-surface px-2 py-1 text-site-foreground">
          <span>CTRL</span>
          <span>/</span>
        </span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groups).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items?.map((command) => (
                <CommandItem
                  key={command.title}
                  value={command.title}
                  onSelect={() => {
                    setOpen(false);
                    window.setTimeout(command.run, 20);
                  }}
                >
                  <span>{command.emoji}</span>
                  <span>{command.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

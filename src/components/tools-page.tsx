import { Link } from "@tanstack/react-router";
import { categories, tools } from "$content/index";
import { capitalizeString } from "$utils/string-formatter";
import { ToolCard } from "./cards";
import { HeroSection } from "./site";
import { Icon } from "./icon";

export function ToolsPage({ category }: { category?: string }) {
  const filtered = category
    ? tools.filter((tool) => tool.categories.includes(category))
    : [...tools].sort((a, b) => a.title.localeCompare(b.title));
  const usedCategories = categories.filter((candidate) =>
    tools.some((tool) => tool.categories.includes(candidate.id)),
  );

  return (
    <>
      <HeroSection title="Tools I Use 💼">
        <p className="font-bold">
          On this page, I have categorized the tools I use in my digital space.
        </p>
        <p>
          There&apos;s <strong>{filtered.length}</strong> tools in total on this page.
        </p>
      </HeroSection>

      <section aria-label="Tool categories" style={{ viewTransitionName: "tool-categories" }}>
        <ul className="flex flex-wrap justify-center gap-2 font-site-heading text-sm tracking-wide md:gap-3">
          <li>
            <Link
              to="/tools"
              aria-current={!category ? "page" : undefined}
              className="flex cursor-pointer items-center gap-2 rounded-md border-x border-b-2 border-t border-site-border bg-site-card px-3 py-2 hover:text-site-heading-hover aria-[current=page]:border-site-border-hover aria-[current=page]:text-site-heading-hover"
            >
              <Icon name="mdi:treasure-chest" />
              <span>All</span>
            </Link>
          </li>
          {usedCategories.map((item) => (
            <li key={item.id}>
              <Link
                to="/tools/$category"
                params={{ category: item.id }}
                aria-current={category === item.id ? "page" : undefined}
                className="group flex cursor-pointer items-center gap-2 rounded-md border-x border-b-2 border-t border-site-border bg-site-card px-3 py-2 hover:text-site-heading-hover aria-[current=page]:border-site-border-hover aria-[current=page]:text-site-heading-hover"
              >
                <Icon name={item.icon} />
                <span>
                  {item.name}{" "}
                  <span className="font-bold">
                    ({tools.filter((tool) => tool.categories.includes(item.id)).length})
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </section>
    </>
  );
}

export function toolsTitle(category?: string) {
  return category ? `Tools - ${capitalizeString(category)}` : "Tools";
}

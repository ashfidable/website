import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

await test("OG cache reuses unchanged images and invalidates only affected cards", () => {
  const root = resolve(import.meta.dirname, "..");
  const fixture = mkdtempSync(resolve(tmpdir(), "og-cache-test-"));
  try {
    for (const path of [
      "scripts/generate-og-images.mjs",
      "scripts/fonts",
      "src/content/posts",
      "site.config.json",
      "pnpm-lock.yaml",
    ]) {
      cpSync(resolve(root, path), resolve(fixture, path), { recursive: true });
    }
    symlinkSync(resolve(root, "node_modules"), resolve(fixture, "node_modules"), "dir");
    const run = () =>
      execFileSync(process.execPath, [resolve(fixture, "scripts/generate-og-images.mjs")], {
        encoding: "utf8",
      });
    const output = resolve(fixture, "public/images/og/blog/hello-world.png");
    const other = resolve(fixture, "public/images/og/default.png");
    const hash = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
    run();
    const original = hash(output);
    const originalTime = statSync(output).mtimeMs;
    run();
    assert.equal(statSync(output).mtimeMs, originalTime, "Unchanged PNG must not be rewritten");

    const post = resolve(fixture, "src/content/posts/blog/hello-world.mdx");
    writeFileSync(post, readFileSync(post, "utf8") + "\nBody-only edit.\n");
    run();
    assert.equal(statSync(output).mtimeMs, originalTime, "Prose does not affect the social card");

    const otherTime = statSync(other).mtimeMs;
    writeFileSync(
      post,
      readFileSync(post, "utf8").replace("title: Hello, World!", "title: A changed title"),
    );
    run();
    assert.notEqual(hash(output), original, "Title changes must render a new card");
    assert.equal(statSync(other).mtimeMs, otherTime, "Other cards stay cached");

    const changed = hash(output);
    rmSync(output);
    run();
    assert.equal(hash(output), changed, "Missing output is regenerated");
    writeFileSync(output, "corrupt PNG");
    run();
    assert.equal(hash(output), changed, "Damaged output is regenerated");

    const script = resolve(fixture, "scripts/generate-og-images.mjs");
    writeFileSync(script, readFileSync(script, "utf8") + "\n// Template revision\n");
    assert.match(run(), /rendered 6, reused 0/, "Generator edits invalidate every card");
    const font = resolve(fixture, "scripts/fonts/JetBrainsMono-Regular.ttf");
    writeFileSync(font, Buffer.concat([readFileSync(font), Buffer.from([0])]));
    assert.match(run(), /rendered 6, reused 0/, "Font edits invalidate every card");
    const configPath = resolve(fixture, "site.config.json");
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    config.terminal.host = "test-garden";
    writeFileSync(configPath, JSON.stringify(config));
    assert.match(run(), /rendered 6, reused 0/, "Branding changes invalidate every card");
    assert.match(run(), /rendered 0, reused 6/);
    const lockfile = resolve(fixture, "pnpm-lock.yaml");
    writeFileSync(lockfile, readFileSync(lockfile, "utf8") + "\n# Renderer dependency revision\n");
    assert.match(run(), /rendered 6, reused 0/, "Dependency changes invalidate every card");
    writeFileSync(resolve(fixture, ".cache/og/manifest.json"), "broken cache");
    assert.match(run(), /rendered 6, reused 0/, "Corrupt cache does not prevent regeneration");
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

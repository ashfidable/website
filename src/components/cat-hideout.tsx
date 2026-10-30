import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useSettings } from "@/providers/settings-provider";
import "../styles/cats.css";

const names = ["Tundra", "Maple"];
const words = [
  ["hiss!", "mrrp", "pounce", "!!", "nom?", "mine."],
  ["blep", "mew?", "purr", "rude.", "hm.", "again?"],
];
// Ordinary pops; Maple's loaf takes three boops and her bandana is worth three points.
const regular = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 1],
  [1, 2],
];
const LOAF = [1, 3];
const FANCY = [1, 4];
const BEST_KEY = "cat-boops-best";

type Pop = {
  id: number;
  cat: number;
  pose: number;
  x: number;
  y: number;
  tilt: number;
  hp: number;
  points: number;
  state: "in" | "hit" | "out";
};
type Float = { id: number; x: number; y: number; text: string; big?: boolean };
export type CatTrick = { kind: "meow" | "pspsps"; id: number };

export const sticker = (cat: number, pose: number) => `/images/cats/${names[cat]}${pose}.png`;
const isLoaf = (pop: Pop) => pop.cat === LOAF[0] && pop.pose === LOAF[1];
let nextId = 0;
let audio: AudioContext | undefined;

/** A little pitch-dropping "boop" that climbs with the combo. */
function chirp(step: number) {
  try {
    audio ??= new AudioContext();
    const now = audio.currentTime;
    const pitch = 420 * 2 ** (Math.min(step, 12) / 12);
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch / 2, now + 0.12);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain).connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  } catch {}
}

/** Boop-the-cat, only playable while the terminal is minimized. */
export function CatHideout({ active, trick }: { active: boolean; trick?: CatTrick | null }) {
  const { sound } = useSettings();
  const [pops, setPopState] = useState<Pop[]>([]);
  const [floats, setFloats] = useState<Float[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [combo, setCombo] = useState(0);
  const [startBest, setStartBest] = useState(0);
  const [perched, setPerched] = useState(false);
  const [zoomies, setZoomies] = useState(0);
  const [rain, setRain] = useState(0);
  const popsRef = useRef(pops);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const timers = useRef(new Set<number>());
  const handledTrick = useRef(0);

  function later(fn: () => void, ms: number) {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      fn();
    }, ms);
    timers.current.add(timer);
  }

  function setPops(update: (current: Pop[]) => Pop[]) {
    popsRef.current = update(popsRef.current);
    setPopState(popsRef.current);
  }

  function float(x: number, y: number, text: string, big = false) {
    const id = nextId++;
    setFloats((current) => [...current, { id, x, y, text, big }]);
    later(() => setFloats((current) => current.filter((item) => item.id !== id)), 900);
  }

  function spawn(crowd = false) {
    const level = Math.min(scoreRef.current, 40) / 40;
    const live = popsRef.current.filter((pop) => pop.state === "in");
    if (live.length >= (crowd ? 6 : 2 + Math.round(level * 2))) return;
    const roll = Math.random();
    const [cat, pose] =
      roll < 0.08 ? FANCY : roll < 0.16 ? LOAF : regular[Math.floor(Math.random() * 6)];
    // Keep cats apart and clear of the score and dock.
    let x = 50;
    let y = 45;
    for (let tries = 0; tries < 8; tries++) {
      x = 12 + Math.random() * 76;
      y = 22 + Math.random() * 46;
      if (live.every((pop) => Math.hypot(pop.x - x, pop.y - y) > 22)) break;
    }
    const pop: Pop = {
      id: nextId++,
      cat,
      pose,
      x,
      y,
      tilt: Math.round(Math.random() * 24 - 12),
      hp: 1,
      points: cat === FANCY[0] && pose === FANCY[1] ? 3 : 1,
      state: "in",
    };
    if (isLoaf(pop)) pop.hp = 3;
    setPops((current) => [...current, pop]);
    later(() => escape(pop.id), isLoaf(pop) ? 3600 : 2300 - level * 1200);
  }

  function escape(id: number) {
    if (!popsRef.current.some((pop) => pop.id === id && pop.state === "in")) return;
    setPops((current) => current.map((pop) => (pop.id === id ? { ...pop, state: "out" } : pop)));
    comboRef.current = 0;
    setCombo(0);
    later(() => setPops((current) => current.filter((pop) => pop.id !== id)), 400);
  }

  function award(points: number) {
    scoreRef.current += points;
    comboRef.current += 1;
    setScore(scoreRef.current);
    setCombo(comboRef.current);
    if (sound) chirp(comboRef.current);
    if (comboRef.current % 10 === 0) {
      setZoomies((count) => count + 1);
      float(50, 40, "ZOOMIES", true);
    }
  }

  function boop(id: number) {
    const pop = popsRef.current.find((item) => item.id === id);
    if (!pop || pop.state !== "in") return;
    if (pop.hp > 1) {
      setPops((current) =>
        current.map((item) => (item.id === id ? { ...item, hp: item.hp - 1 } : item)),
      );
      float(pop.x, pop.y - 12, pop.hp === 3 ? "…" : "no.");
      return;
    }
    setPops((current) =>
      current.map((item) => (item.id === id ? { ...item, state: "hit" } : item)),
    );
    award(pop.points);
    const list = words[pop.cat];
    const word = list[Math.floor(Math.random() * list.length)];
    float(pop.x, pop.y - 12, pop.points > 1 ? "+3 fancy" : isLoaf(pop) ? "fine." : word);
    later(() => setPops((current) => current.filter((item) => item.id !== id)), 420);
  }

  useEffect(() => {
    const saved = Number(localStorage.getItem(BEST_KEY));
    if (saved > 0) setBest(saved);
  }, []);

  useEffect(() => {
    if (score <= best) return;
    setBest(score);
    localStorage.setItem(BEST_KEY, String(score));
  }, [score, best]);

  // Each minimize starts a fresh round.
  useEffect(() => {
    if (!active) return;
    scoreRef.current = 0;
    comboRef.current = 0;
    setScore(0);
    setCombo(0);
    setStartBest(best);
    for (const [cat, pose] of [...regular, LOAF, FANCY]) new Image().src = sticker(cat, pose);
    const loop = () => {
      spawn();
      const level = Math.min(scoreRef.current, 40) / 40;
      later(loop, 850 - level * 400 + Math.random() * 450);
    };
    later(loop, 350);
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
      pending.clear();
      setPops(() => []);
      setFloats([]);
      setPerched(false);
      setZoomies(0);
      setRain(0);
    };
  }, [active]);

  // Leave the game alone and someone sits on your terminal.
  useEffect(() => {
    if (!active || perched) return;
    const timer = window.setTimeout(() => setPerched(true), 7000);
    return () => clearTimeout(timer);
  }, [active, perched, score]);

  function perform(kind: CatTrick["kind"]) {
    if (kind === "meow") setRain((count) => count + 1);
    else for (let i = 0; i < 4; i++) later(() => spawn(true), i * 120);
  }

  // The terminal's `meow` and `pspsps` commands minimize the window, then play here.
  useEffect(() => {
    if (!active || !trick || trick.id === handledTrick.current) return;
    handledTrick.current = trick.id;
    later(() => perform(trick.kind), 250);
  }, [active, trick]);

  // The same secret words also work typed straight at the cats.
  useEffect(() => {
    if (!active) return;
    let typed = "";
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
      typed = (typed + event.key.toLowerCase()).slice(-6);
      if (typed.endsWith("meow")) {
        typed = "";
        perform("meow");
      } else if (typed === "pspsps") {
        typed = "";
        perform("pspsps");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (!active) return null;
  const record = startBest > 0 && score > startBest;

  return (
    <section className="cat-game" aria-label="Boop the cats">
      <div className="cat-hud">
        <p className="cat-chip cat-score" aria-live="polite">
          <span aria-hidden="true">🐾</span>
          <b key={score}>{score}</b>
        </p>
        {best > 0 && (
          <p className="cat-chip cat-best" data-new={record}>
            <span aria-hidden="true">👑</span>
            <span className="sr-only">best</span>
            <b>{best}</b>
            {record && (
              <span className="cat-chip cat-new" aria-hidden="true">
                new!
              </span>
            )}
          </p>
        )}
        {combo >= 3 && (
          <span className="cat-chip cat-combo" key={combo}>
            ×{combo}
          </span>
        )}
      </div>

      {pops.map((pop) => (
        <button
          key={pop.id}
          type="button"
          className="cat-pop"
          data-state={pop.state}
          data-fancy={pop.points > 1}
          data-hurt={pop.hp < 3 && isLoaf(pop)}
          onPointerDown={(event) => {
            if (event.pointerType !== "mouse" || event.button === 0) boop(pop.id);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            boop(pop.id);
          }}
          aria-label={`Boop ${names[pop.cat]}`}
          style={
            { "--x": `${pop.x}%`, "--y": `${pop.y}%`, "--tilt": `${pop.tilt}deg` } as CSSProperties
          }
        >
          <img
            key={pop.hp}
            src={sticker(pop.cat, pop.pose)}
            alt=""
            width={512}
            height={512}
            draggable={false}
          />
        </button>
      ))}

      {perched && (
        <button
          type="button"
          className="cat-perched"
          onClick={() => {
            setPerched(false);
            award(1);
            float(50, 100 - (170 / window.innerHeight) * 100, "rude.");
          }}
          aria-label="Shoo Maple off the terminal"
        >
          <img src={sticker(1, 3)} alt="" width={512} height={512} draggable={false} />
        </button>
      )}

      {zoomies > 0 && (
        <div className="cat-zoomies" key={zoomies} aria-hidden="true">
          <img src={sticker(0, 1)} alt="" />
          <img src={sticker(1, 2)} alt="" />
        </div>
      )}

      {rain > 0 && (
        <div className="cat-rain" key={rain} aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => (
            <img
              key={i}
              src={sticker(i % 2, (i % 4) + 1)}
              alt=""
              style={
                {
                  left: `${(i * 37) % 100}%`,
                  animationDelay: `${(i * 113) % 900}ms`,
                  "--spin": `${((i * 71) % 120) - 60}deg`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      {floats.map((item) => (
        <span
          key={item.id}
          className="cat-float"
          data-big={item.big}
          aria-hidden="true"
          style={{ "--x": `${item.x}%`, "--y": `${item.y}%` } as CSSProperties}
        >
          {item.text}
        </span>
      ))}
    </section>
  );
}

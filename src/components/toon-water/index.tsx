import { useEffect, useRef, useState } from "react";
import { PreviewButton, PreviewButtons, PreviewControls, PreviewSlider } from "../preview-controls";
import type { createWaterScene } from "./scene";
import "./water.css";

export function ToonWater() {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<ReturnType<typeof createWaterScene> | null>(null);
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [waves, setWaves] = useState(0.14);
  const [foam, setFoam] = useState(0.8);
  useEffect(() => {
    let cancelled = false;
    import("./scene")
      .then(({ createWaterScene }) => {
        if (cancelled || !host.current) return;
        try {
          scene.current = createWaterScene(host.current);
          setPaused(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
          setReady(true);
        } catch {
          setStatus("The preview needs WebGL. You can still read the shaders below.");
        }
      })
      .catch(() => {
        if (!cancelled)
          setStatus("The preview could not load. Refresh to try again; the shaders are below.");
      });
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);
  return (
    <figure className="toon-water">
      <div className="toon-water-stage">
        <div className="toon-water-canvas" ref={host} />
        {status && (
          <div className="toon-water-status" role="status">
            {status}
          </div>
        )}
        <span className="toon-water-hint">Throw the crate · Tap the water · Drag to orbit</span>
      </div>
      <PreviewControls label="Water preview controls" disabled={!ready}>
        <PreviewSlider
          label="Waves"
          min={0}
          max={0.3}
          step={0.01}
          value={waves}
          onChange={(value) => {
            setWaves(value);
            scene.current?.setWaves(value);
          }}
        />
        <PreviewSlider
          label="Foam"
          min={0}
          max={1}
          step={0.01}
          value={foam}
          onChange={(value) => {
            setFoam(value);
            scene.current?.setFoam(value);
          }}
        />
        <PreviewButtons>
          <PreviewButton
            icon="mdi:package-down"
            label="Drop crate"
            disabled={paused}
            onClick={() => scene.current?.drop()}
          />
          <PreviewButton
            icon={paused ? "mdi:play" : "mdi:pause"}
            label={paused ? "Play" : "Pause"}
            onClick={() => {
              scene.current?.setPaused(!paused);
              setPaused(!paused);
            }}
          />
          <PreviewButton
            icon="mdi:camera-retake-outline"
            label="Reset view"
            onClick={() => scene.current?.resetView()}
          />
        </PreviewButtons>
      </PreviewControls>
      <noscript>
        <p>Enable JavaScript for the interactive water preview. The shader code is below.</p>
      </noscript>
    </figure>
  );
}

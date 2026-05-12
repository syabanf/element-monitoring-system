"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Activity } from "lucide-react";
import { SensorTile, type SensorTileData } from "./SensorTile";

const PILLAR_CFG: Record<string, { color: string; label: string }> = {
  ELECTRICITY:    { color: "#B45309", label: "Electricity"    },
  WATER:          { color: "#1E5FA8", label: "Water"          },
  WASTEWATER:     { color: "#7C3AED", label: "Wastewater"     },
  GAS_AIR:        { color: "#166534", label: "Gas / Air"      },
  ENVIRONMENT:    { color: "#0891B2", label: "Environment"    },
  THERMAL_HVAC:   { color: "#B8901A", label: "Thermal / HVAC" },
  COMPRESSED_AIR: { color: "#0E7490", label: "Compressed Air" },
};

export interface SiteSlide {
  siteId: string;
  siteName: string;
  byPillar: [string, SensorTileData[]][];
}

const AUTO_INTERVAL = 15_000; // ms between auto-slides

export function ScadaCarousel({ slides }: { slides: SiteSlide[] }) {
  const [current,  setCurrent ] = useState(0);
  const [auto,     setAuto    ] = useState(slides.length > 1);
  const [animDir,  setAnimDir ] = useState<"left" | "right">("right");
  const [animKey,  setAnimKey ] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback((dir: "prev" | "next" | number) => {
    setCurrent((prev) => {
      let next: number;
      if (dir === "prev")  { setAnimDir("left");  next = (prev - 1 + slides.length) % slides.length; }
      else if (dir === "next") { setAnimDir("right"); next = (prev + 1) % slides.length; }
      else { setAnimDir(dir > prev ? "right" : "left"); next = dir; }
      return next;
    });
    setAnimKey((k) => k + 1);
  }, [slides.length]);

  useEffect(() => {
    if (!auto || slides.length <= 1) return;
    timerRef.current = setTimeout(() => go("next"), AUTO_INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [auto, current, go, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current];
  const total = slides.reduce((n, s) => n + s.byPillar.reduce((m, [, arr]) => m + arr.length, 0), 0);
  const slideCount = slide.byPillar.reduce((n, [, arr]) => n + arr.length, 0);
  const onlineCount = slide.byPillar.reduce((n, [, arr]) => n + arr.filter((s) => s.status === "ONLINE").length, 0);

  return (
    <div className="space-y-4">
      {/* Carousel controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Site info */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #0D1B35, #1E3A6A)", color: "#fff" }}
          >
            <Activity className="w-3 h-3" />
            {slide.siteName}
          </div>
          <span className="text-[#6378A0] text-xs">
            {onlineCount}/{slideCount} sensors online
          </span>
        </div>

        {/* Nav: dots + arrows */}
        <div className="flex items-center gap-3">
          {/* Auto play toggle */}
          {slides.length > 1 && (
            <button
              onClick={() => setAuto((a) => !a)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ background: auto ? "rgba(184,144,26,0.15)" : "rgba(13,27,53,0.07)", color: auto ? "#B8901A" : "#98A8C0" }}
              title={auto ? "Pause auto-advance" : "Play auto-advance"}
            >
              {auto ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          )}

          {/* Dot indicators */}
          {slides.length > 1 && (
            <div className="flex items-center gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.siteId}
                  onClick={() => go(i)}
                  className="transition-all duration-200 rounded-full"
                  style={{
                    width:  i === current ? 20 : 7,
                    height: 7,
                    backgroundColor: i === current ? "#B8901A" : "rgba(13,27,53,0.18)",
                  }}
                  title={s.siteName}
                />
              ))}
            </div>
          )}

          {/* Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={() => go("prev")}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: "rgba(13,27,53,0.08)", color: "#6378A0" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => go("next")}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: "rgba(13,27,53,0.08)", color: "#6378A0" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar (auto-advance timer) */}
      {auto && slides.length > 1 && (
        <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "rgba(13,27,53,0.07)" }}>
          <div
            key={`prog-${current}-${animKey}`}
            className="h-full rounded-full origin-left"
            style={{
              backgroundColor: "#B8901A",
              animation: `scadaProgress ${AUTO_INTERVAL}ms linear forwards`,
            }}
          />
        </div>
      )}

      {/* Slide content */}
      <div
        key={`slide-${current}-${animKey}`}
        className="space-y-5"
        style={{
          animation: `slideIn${animDir === "right" ? "Right" : "Left"} 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both`,
        }}
      >
        {slide.byPillar.map(([pillar, tileSensors]) => {
          const pcfg = PILLAR_CFG[pillar] ?? { color: "#6378A0", label: pillar };
          const pillarOnline = tileSensors.filter((s) => s.status === "ONLINE").length;
          return (
            <div key={pillar} className="space-y-3">
              {/* Pillar sub-header */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: pcfg.color }} />
                <span className="text-[#0D1B35] text-sm font-bold">{pcfg.label}</span>
                <span className="text-[#98A8C0] text-xs">{pillarOnline}/{tileSensors.length} online</span>
                <div className="h-px flex-1" style={{ backgroundColor: `${pcfg.color}22` }} />
              </div>

              {/* Sensor grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {tileSensors.map((sensor) => (
                  <SensorTile key={sensor.id} s={sensor} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <p className="text-[#C0CCDE] text-[10px] text-center">
        Site {current + 1} of {slides.length} · {total} total sensors across all sites
      </p>

      {/* Keyframe styles */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0);     }
        }
        @keyframes scadaProgress {
          from { width: 0%;    }
          to   { width: 100%;  }
        }
      `}</style>
    </div>
  );
}

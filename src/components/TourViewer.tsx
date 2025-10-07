import React, { useEffect, useRef, useState } from "react";
import "pannellum/build/pannellum.css";
import { Tour, Hotspot, Scene } from "../types";
import { Button } from "../components/ui/Button";

interface TourViewerProps {
  tour: Tour;
  editMode?: boolean;
  onHotspotAdd?: (hotspot: Hotspot) => void;
  onHotspotUpdate?: (hotspot: Hotspot) => void;
  onHotspotDelete?: (hotspotId: string) => void;
  onSceneReplace?: (scene: Scene, newImageUrl: string) => void;
}

// Define PannellumViewer type to remove `any`
type PannellumViewer = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (event: string, callback: (arg: any) => void) => void;
  getScene: () => string;
  mouseEventToCoords: (evt: MouseEvent) => [number, number] | null;
};

export const TourViewer: React.FC<TourViewerProps> = ({
  tour,
  editMode = false,
  onHotspotAdd,
  onHotspotUpdate,
  onHotspotDelete,
  onSceneReplace,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string>(tour.scenes[0]?.id || "");

  useEffect(() => {
    if (!tour || !containerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pannellum = (window as any).pannellum;
    if (!pannellum) return console.error("Pannellum not loaded");

    containerRef.current.innerHTML = "";
    const localContainer = containerRef.current; // fix cleanup warning

    const scenesMap: Record<string, unknown> = {};
    tour.scenes.forEach((scene: Scene, idx: number) => {
      const next = tour.scenes[idx + 1];
      const autoHotspots: Hotspot[] = next
        ? [
            {
              id: `auto-${next.id}`,
              title: `Go to ${next.title}`,
              yaw: 0,
              pitch: 0,
              sceneId: next.id,
              type: "scene",
            },
          ]
        : [];

      scenesMap[scene.id] = {
        title: scene.title,
        type: "equirectangular",
        panorama: scene.imageUrl,
        hotSpots: [
          ...(scene.hotspots || []).map((hs: Hotspot) => ({
            ...hs,
            type: "info",
            createTooltipFunc: (div: HTMLElement) => {
              div.innerHTML = `<div style="padding:4px 6px; background:rgba(0,0,0,0.6); color:white; border-radius:4px; font-size:12px;">${hs.title}</div>`;
              div.style.cursor = "pointer";
              div.onclick = () => setSelectedHotspot(hs);
            },
          })),
          ...autoHotspots,
        ],
      };
    });

    const viewer: PannellumViewer = pannellum.viewer(localContainer, {
      default: {
        firstScene: tour.scenes[0]?.id,
        autoLoad: true,
        sceneFadeDuration: 500,
      },
      scenes: scenesMap,
    });

    setCurrentSceneId(tour.scenes[0]?.id || "");
    viewer.on("scenechange", (sceneId: string) => setCurrentSceneId(sceneId));

    // Add hotspot on click in edit mode
    if (editMode && onHotspotAdd) {
      const clickHandler = (evt: MouseEvent) => {
        const coords = viewer.mouseEventToCoords(evt);
        if (!coords) return;
        const newHotspot: Hotspot = {
          id: `hs-${Date.now()}`,
          title: "New Hotspot",
          yaw: coords[0],
          pitch: coords[1],
          sceneId: viewer.getScene(),
        };
        onHotspotAdd(newHotspot);
        setSelectedHotspot(newHotspot);
      };
      localContainer.addEventListener("click", clickHandler);
      return () => localContainer.removeEventListener("click", clickHandler);
    }
  }, [tour, editMode, onHotspotAdd]);

  if (!tour) return null;

  const currentScene = tour.scenes.find((s) => s.id === currentSceneId);

  return (
    <div className="flex flex-col space-y-2">
      <div
        ref={containerRef}
        style={{ width: "100%", height: "500px", background: "#000", borderRadius: "12px" }}
      />

      {/* Scene Controls */}
      {editMode && currentScene && (
        <div className="bg-gray-100 p-2 rounded-md flex items-center justify-between space-x-2">
          <span className="font-medium">{currentScene.title}</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const url = URL.createObjectURL(file);
                onSceneReplace?.(currentScene, url);
              }
            }}
            className="border p-1 rounded"
          />
        </div>
      )}

      {/* Hotspot Editor */}
      {selectedHotspot && editMode && (
        <div className="bg-gray-200 p-2 rounded-md mt-2">
          <h4 className="font-semibold">Edit Hotspot</h4>
          <input
            type="text"
            value={selectedHotspot.title}
            onChange={(e) => {
              const updated = { ...selectedHotspot, title: e.target.value };
              setSelectedHotspot(updated);
              onHotspotUpdate?.(updated);
            }}
            className="border p-1 rounded w-full mb-1"
          />
          <div className="flex space-x-2">
            <input
              type="number"
              value={selectedHotspot.yaw}
              onChange={(e) => {
                const updated = { ...selectedHotspot, yaw: parseFloat(e.target.value) };
                setSelectedHotspot(updated);
                onHotspotUpdate?.(updated);
              }}
              placeholder="Yaw"
              className="border p-1 rounded w-1/2"
            />
            <input
              type="number"
              value={selectedHotspot.pitch}
              onChange={(e) => {
                const updated = { ...selectedHotspot, pitch: parseFloat(e.target.value) };
                setSelectedHotspot(updated);
                onHotspotUpdate?.(updated);
              }}
              placeholder="Pitch"
              className="border p-1 rounded w-1/2"
            />
          </div>
          <div className="flex space-x-2 mt-1">
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                onHotspotDelete?.(selectedHotspot.id);
                setSelectedHotspot(null);
              }}
            >
              Delete
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setSelectedHotspot(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

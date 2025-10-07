import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { api } from "../services/api";
import { Tour, Hotspot, Scene } from "../types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Camera, CheckCircle, XCircle, Clock, Activity, Link } from "lucide-react";
import { TourViewer } from "../components/TourViewer";
import { useTheme } from "../contexts/ThemeContext";

export const ToursPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTour, setPreviewTour] = useState<Tour | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [embedKey, setEmbedKey] = useState<string | null>(null);

  useEffect(() => { loadTours(); }, []);

  const loadTours = async () => {
    try {
      const data = await api.getTours();
      setTours(data);
    } catch (error) {
      console.error("Failed to load tours:", error);
    } finally { setLoading(false); }
  };

  const approveTour = async (tourId: string) => { await api.approveTour(tourId); loadTours(); };
  const rejectTour = async (tourId: string) => { await api.rejectTour(tourId); loadTours(); };

  const generateEmbedKey = (tourId: string) => {
    const key = `https://yourdomain.com/embed/${tourId}`;
    setEmbedKey(key);
    navigator.clipboard.writeText(key);
    alert("Embed link copied to clipboard!");
  };

  const updateHotspot = async (hotspot: Hotspot) => { await api.updateHotspot(hotspot.id, hotspot); loadTours(); };
  const deleteHotspot = async (hotspotId: string) => { await api.deleteHotspot(hotspotId); loadTours(); };
  const addHotspot = async (hotspot: Hotspot) => { await api.createHotspot(hotspot); loadTours(); };
  const replaceScene = async (scene: Scene, url: string) => { await api.replaceSceneImage(scene.id, url); loadTours(); };

  if (loading) return <div className={`flex items-center justify-center h-64 ${isDark ? "text-gray-300" : "text-gray-500"}`}>Loading tours...</div>;

  return (
    <div className={`${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} space-y-6 min-h-screen p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">360° Tour Management</h1>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>Edit scenes, hotspots, and embed virtual tours.</p>
        </div>
        <Button onClick={() => setEditMode(!editMode)}>{editMode ? "Exit Edit Mode" : "Enter Edit Mode"}</Button>
      </div>

      {/* Tours Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{`Tours (${tours.length})`}</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Scenes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className={`${isDark ? "bg-gray-900 divide-gray-700" : "bg-white divide-gray-200"}`}>
                {tours.map((tour) => (
                  <tr key={tour.id} className={`${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4 flex items-center">
                      <Camera className="h-6 w-6 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium">{tour.title}</div>
                        <div className={`${isDark ? "text-gray-400" : "text-gray-500"} text-xs`}>ID: {tour.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{tour.clientName}</td>
                    <td className="px-6 py-4">{tour.scenes.length}</td>
                    <td className="px-6 py-4"><Badge variant="info">{tour.status}</Badge></td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => { setPreviewTour(tour); setShowPreviewModal(true); }}>Preview</Button>
                      <Button size="sm" variant="outline" onClick={() => generateEmbedKey(tour.id)}>
                        <Link className="w-4 h-4 mr-1" />Embed
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => approveTour(tour.id)}>Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => rejectTour(tour.id)}>Reject</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewTour && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => { setShowPreviewModal(false); setPreviewTour(null); }}
          title={`Preview: ${previewTour.title}`}
        >
          <TourViewer
            tour={previewTour}
            editMode={editMode}
            onHotspotAdd={addHotspot}
            onHotspotUpdate={updateHotspot}
            onHotspotDelete={deleteHotspot}
            onSceneReplace={replaceScene}
          />
        </Modal>
      )}

      {/* Embed Key */}
      {embedKey && (
        <div className={`${isDark ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-900"} p-4 rounded-md mt-6`}>
          <h3 className="font-semibold mb-2">Embed Code:</h3>
          <code className={`${isDark ? "bg-gray-900" : "bg-white"} p-2 rounded block`}>
            {`<iframe src="${embedKey}" width="100%" height="600" frameborder="0"></iframe>`}
          </code>
        </div>
      )}
    </div>
  );
};

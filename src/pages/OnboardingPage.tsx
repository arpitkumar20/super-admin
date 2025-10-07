import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { useTheme } from "../contexts/ThemeContext";

interface DocumentFile {
  id: string;
  name: string;
  type: string;
  file: File;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  clientRef?: string;
  urls: string[];
  address: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  connector?: "PostgreSQL" | "Zoho" | null;
  documents: DocumentFile[];
  logo?: string;
}

interface ConnectorData {
  type: "PostgreSQL" | "Zoho" | null;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  dbName?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

export const OnboardingPage: React.FC = () => {
  const { theme } = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [connectorData, setConnectorData] = useState<ConnectorData>({ type: null });
  const [showClientModal, setShowClientModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);

  // --- Start Onboarding ---
  const startOnboarding = () => {
    const newClient: Client = {
      id: Date.now().toString(),
      name: "",
      email: "",
      phone: "",
      urls: [],
      address: "",
      notes: "",
      status: "pending",
      connector: null,
      documents: [],
    };
    setSelectedClient(newClient);
    setConnectorData({ type: null });
    setIsEditing(true);
    setWizardStep(0);
    setShowClientModal(true);
  };

  // --- Handle Client Field Change ---
  const handleClientChange = <K extends keyof Client>(field: K, value: Client[K]) => {
    if (!selectedClient) return;
    setSelectedClient({ ...selectedClient, [field]: value });
  };

  // --- Handle Connector Change ---
  const handleConnectorChange = <K extends keyof ConnectorData>(field: K, value: ConnectorData[K]) => {
    setConnectorData({ ...connectorData, [field]: value });
  };

  // --- Handle Logo Upload ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedClient || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setSelectedClient({ ...selectedClient, logo: url });
  };

  // --- Handle File Upload ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedClient || !e.target.files) return;
    const newDocs: DocumentFile[] = Array.from(e.target.files).map((file) => ({
      id: Date.now() + "-" + file.name,
      name: file.name,
      type: file.type,
      file,
    }));
    setSelectedClient({
      ...selectedClient,
      documents: [...selectedClient.documents, ...newDocs],
    });
  };

  const removeDocument = (docId: string) => {
    if (!selectedClient) return;
    setSelectedClient({
      ...selectedClient,
      documents: selectedClient.documents.filter((d) => d.id !== docId),
    });
  };

  const saveClient = () => {
    if (!selectedClient) return;
    const exists = clients.some((c) => c.id === selectedClient.id);
    const updatedClient = { ...selectedClient, connector: connectorData.type };
    if (exists) {
      setClients(clients.map((c) => (c.id === selectedClient.id ? updatedClient : c)));
    } else {
      setClients([...clients, updatedClient]);
    }
    setShowClientModal(false);
    setSelectedClient(null);
    setIsEditing(false);
  };

  const openDocument = (doc: DocumentFile) => {
    const url = URL.createObjectURL(doc.file);
    window.open(url, "_blank");
  };

  const wizardSteps = ["Upload Logo", "Client Details", "Document Upload", "Connector Setup"];

  const validateStep = () => {
    if (!selectedClient) return false;
    switch (wizardStep) {
      case 0:
        return !!selectedClient.logo;
      case 1:
        return !!selectedClient.name && !!selectedClient.email && !!selectedClient.phone;
      case 2:
        return true;
      case 3:
        if (!connectorData.type) return false;
        if (connectorData.type === "PostgreSQL")
          return !!connectorData.host && !!connectorData.user && !!connectorData.dbName;
        if (connectorData.type === "Zoho")
          return !!connectorData.clientId && !!connectorData.clientSecret;
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep()) return alert("Please fill required fields to proceed.");
    setWizardStep((prev) => Math.min(prev + 1, wizardSteps.length - 1));
  };

  const prevStep = () => setWizardStep((prev) => Math.max(prev - 0, 0));

  // --- Render Wizard Steps ---
  const renderWizard = () => {
    if (!selectedClient) return null;

    const inputClass =
      "w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
      (theme === "dark"
        ? "bg-gray-800 text-gray-200 border-gray-700 placeholder-gray-400"
        : "bg-white text-gray-700 border-gray-300 placeholder-gray-500");

    return (
      <div className={`w-full max-w-7xl mx-auto space-y-6 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
        {/* Stepper */}
        <div className="flex justify-between mb-6">
          {wizardSteps.map((step, index) => (
            <div key={index} className="flex-1 text-center">
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white font-semibold ${
                  wizardStep === index
                    ? "bg-blue-500"
                    : index < wizardStep
                    ? "bg-green-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                {index + 1}
              </div>
              <p className="mt-2 text-sm font-medium">{step}</p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        {wizardStep === 0 && (
          <div className="flex flex-col items-center space-y-4">
            {selectedClient.logo ? (
              <img
                src={selectedClient.logo}
                alt="Logo"
                className="h-32 w-32 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 mb-4"
              />
            ) : (
              <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-500 dark:text-gray-300 text-lg font-semibold">
                Logo
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-gray-500" />
          </div>
        )}

        {wizardStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <input
              type="text"
              value={selectedClient.name}
              onChange={(e) => handleClientChange("name", e.target.value)}
              placeholder="Full Name"
              className={inputClass}
            />
            <input
              type="email"
              value={selectedClient.email}
              onChange={(e) => handleClientChange("email", e.target.value)}
              placeholder="Email"
              className={inputClass}
            />
            <input
              type="tel"
              value={selectedClient.phone}
              onChange={(e) => handleClientChange("phone", e.target.value)}
              placeholder="Phone"
              className={inputClass}
            />
            <input
              type="text"
              value={selectedClient.clientRef || ""}
              onChange={(e) => handleClientChange("clientRef", e.target.value)}
              placeholder="Client Ref"
              className={inputClass}
            />
            <input
              type="text"
              value={selectedClient.urls.join(",")}
              onChange={(e) =>
                handleClientChange(
                  "urls",
                  e.target.value.split(",").map((u) => u.trim())
                )
              }
              placeholder="URLs (comma separated)"
              className={inputClass}
            />
            <input
              type="text"
              value={selectedClient.address}
              onChange={(e) => handleClientChange("address", e.target.value)}
              placeholder="Address"
              className={inputClass}
            />
            <textarea
              value={selectedClient.notes || ""}
              onChange={(e) => handleClientChange("notes", e.target.value)}
              placeholder="Notes"
              className={inputClass + " h-32 resize-none col-span-full"}
            />
          </div>
        )}

        {wizardStep === 2 && (
          <div className="space-y-4">
            <input type="file" multiple onChange={handleFileUpload} className="w-full mb-4" />
            <div
              className={`space-y-2 max-h-80 overflow-y-auto ${
                theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-gray-50 text-gray-700"
              }`}
            >
              {selectedClient.documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex justify-between items-center p-2 border rounded-lg ${
                    theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <span className="cursor-pointer text-blue-500" onClick={() => openDocument(doc)}>
                    {doc.name}
                  </span>
                  <Button size="sm" variant="danger" onClick={() => removeDocument(doc.id)}>
                    Remove
                  </Button>
                </div>
              ))}
              {selectedClient.documents.length === 0 && (
                <p className="text-gray-400 dark:text-gray-300">No documents uploaded</p>
              )}
            </div>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="space-y-4">
            <select
              value={connectorData.type || ""}
              onChange={(e) =>
                handleConnectorChange(
                  "type",
                  e.target.value ? (e.target.value as ConnectorData["type"]) : null
                )
              }
              className={inputClass}
            >
              <option value="">Select Connector</option>
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="Zoho">Zoho</option>
            </select>

            {connectorData.type === "PostgreSQL" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Host"
                  value={connectorData.host || ""}
                  onChange={(e) => handleConnectorChange("host", e.target.value)}
                  className={inputClass}
                />
                <input
                  type="number"
                  placeholder="Port"
                  value={connectorData.port || 5432}
                  onChange={(e) => handleConnectorChange("port", parseInt(e.target.value))}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="DB User"
                  value={connectorData.user || ""}
                  onChange={(e) => handleConnectorChange("user", e.target.value)}
                  className={inputClass}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={connectorData.password || ""}
                  onChange={(e) => handleConnectorChange("password", e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="DB Name"
                  value={connectorData.dbName || ""}
                  onChange={(e) => handleConnectorChange("dbName", e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {connectorData.type === "Zoho" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Client ID"
                  value={connectorData.clientId || ""}
                  onChange={(e) => handleConnectorChange("clientId", e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Client Secret"
                  value={connectorData.clientSecret || ""}
                  onChange={(e) => handleConnectorChange("clientSecret", e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Refresh Token"
                  value={connectorData.refreshToken || ""}
                  onChange={(e) => handleConnectorChange("refreshToken", e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={prevStep}
            disabled={wizardStep === 0}
            className="bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Back
          </Button>
          {wizardStep < wizardSteps.length - 1 ? (
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={saveClient}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
            >
              Save
            </Button>
          )}
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className={`space-y-6 p-6 min-h-screen ${theme === "dark" ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800"}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Client Onboarding</h1>
        <Button
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg"
          onClick={startOnboarding}
        >
          Add Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card
            key={client.id}
            className={`shadow-lg hover:shadow-2xl transition-shadow duration-200 rounded-2xl border ${
              theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}
          >
            <CardHeader
              className={`rounded-t-2xl p-4 flex items-center gap-4 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              {client.logo ? (
                <img
                  src={client.logo}
                  alt="Logo"
                  className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300">
                  Logo
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{client.name}</h3>
              </div>
              <Badge
                variant={
                  client.status === "approved"
                    ? "success"
                    : client.status === "rejected"
                    ? "danger"
                    : "warning"
                }
              >
                {client.status.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className={`p-4 space-y-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
              <p>
                <strong>Email:</strong> {client.email}
              </p>
              <p>
                <strong>Phone:</strong> {client.phone}
              </p>
              <p>
                <strong>Address:</strong> {client.address}
              </p>
              <p>
                <strong>Connector:</strong> {client.connector || "Not configured"}
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="bg-gray-400 text-white hover:bg-gray-500"
                  onClick={() => {
                    setSelectedClient(client);
                    setShowClientModal(true);
                    setIsEditing(false);
                    setConnectorData({ type: client.connector || null });
                  }}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                  onClick={() => {
                    setSelectedClient(client);
                    setShowClientModal(true);
                    setIsEditing(true);
                    setWizardStep(0);
                    setConnectorData({ type: client.connector || null });
                  }}
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        title={isEditing ? "Onboard Client" : "Client Details"}
      >
        {isEditing && selectedClient ? renderWizard() : selectedClient ? (
          <div className="space-y-3">
            <p>
              <strong>Name:</strong> {selectedClient.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedClient.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedClient.phone}
            </p>
            <p>
              <strong>Address:</strong> {selectedClient.address}
            </p>
            <p>
              <strong>Connector:</strong> {selectedClient.connector}
            </p>
            <div>
              <strong>Documents:</strong>
              <ul className="list-disc pl-5 mt-2">
                {selectedClient.documents.map((doc) => (
                  <li
                    key={doc.id}
                    onClick={() => openDocument(doc)}
                    className="cursor-pointer text-blue-500"
                  >
                    {doc.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default OnboardingPage;

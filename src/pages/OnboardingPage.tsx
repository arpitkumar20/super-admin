/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/OnboardingPage.tsx
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { useTheme } from "../contexts/ThemeContext";
import { api } from "../services/api";
import { Client, DocumentFile, ConnectorType } from "../types";

interface ConnectorData {
  type: ConnectorType | null;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  dbName?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

const OnboardingPage: React.FC = () => {
  const { theme } = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [connectorData, setConnectorData] = useState<ConnectorData>({ type: null });
  const [showClientModal, setShowClientModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [stepError, setStepError] = useState<string>("");
  const [docInputKey, setDocInputKey] = useState<number>(0); // for resetting file input
  // Add a state to track the initial client state
  const [initialClientState, setInitialClientState] = useState<Client | null>(null);

  console.log('Theme:', theme);
  console.log('Initial Clients State:', clients);
  console.log('Initial Connector Data:', connectorData);
  console.log('Initial Modal State:', showClientModal);
  console.log('Initial Wizard Step:', wizardStep);

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.getClients();
        // Debug: log the actual data received from the backend
        console.log('GET /client response:', response);
            if (Array.isArray(response)) {
          response.forEach((client, idx) => {
            console.log(`Client #${idx + 1}:`, {
              connector: client.connector,
              config: client.config,
              has_connector: client.has_connector,
              name: client.name,
              id: client.id,
            });
          });
        }
        setClients(response);
      } catch (err) {
        console.error("Failed to fetch clients:", err);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    console.log('Updated Clients State:', clients);
  }, [clients]);

  useEffect(() => {
    console.log('Updated Connector Data:', connectorData);
  }, [connectorData]);

  useEffect(() => {
    console.log('Modal State Changed:', showClientModal);
  }, [showClientModal]);

  useEffect(() => {
    console.log('Wizard Step Changed:', wizardStep);
  }, [wizardStep]);

  useEffect(() => {
    if (selectedClient && isEditing) {
      // Populate connectorData with config values from selectedClient
      if (selectedClient.config) {
        setConnectorData((prev) => ({
          ...prev,
          clientId: selectedClient.config.client_id || "",
          clientSecret: selectedClient.config.client_secret || "",
          refreshToken: selectedClient.config.refresh_token || "",
          host: selectedClient.config.host || "",
          port: selectedClient.config.port || undefined,
          dbName: selectedClient.config.database || "",
          user: selectedClient.config.username || "",
          password: selectedClient.config.password || "",
        }));
      }
    }
  }, [selectedClient, isEditing]);

  const startOnboarding = () => {
    const newClient: Client = {
      id: Date.now().toString(),
      name: "",
      email: "",
      phone: "",
      clientRef: "",
      urls: [],
      address: "",
      notes: "",
      status: "pending",
      connector: null,
      documents: [],
      logo: "",
      currentPlan: "Free",
      company: "",
      contactPerson: "",
      industry: "",
    };
    setSelectedClient(newClient);
    setInitialClientState(newClient); // Track the initial state
    setConnectorData({ type: null });
    setIsEditing(true);
    setWizardStep(0);
    setShowClientModal(true);
  };

  const handleClientChange = <K extends keyof Client>(field: K, value: Client[K]) => {
    if (!selectedClient) return;
    setSelectedClient({ ...selectedClient, [field]: value });
  };

  const handleConnectorChange = <K extends keyof ConnectorData>(field: K, value: ConnectorData[K]) => {
    setConnectorData({ ...connectorData, [field]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedClient || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setSelectedClient({ ...selectedClient, logo: file });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedClient || !e.target.files) return;

    const existingDocs = selectedClient.documents || [];
    const newDocs: DocumentFile[] = Array.from(e.target.files)
      .filter(Boolean)
      .map((file) => {
        console.log('Uploading file:', file); // Debugging log
        return {
          id: Date.now() + '-' + file.name,
          name: file.name,
          type: file.type,
          file,
        };
      });

    if (existingDocs.length + newDocs.length > 5) {
      setStepError('You can upload a maximum of 5 documents.');
      return;
    }

    try {
      // Simulate backend upload and response
      const response = await api.uploadDocuments(newDocs);
      console.log('Backend response for uploaded documents:', response); // Log backend response

      const updatedDocs = response.map((doc: any) => doc.url || doc);
      setSelectedClient({
        ...selectedClient,
        documents: [...existingDocs, ...updatedDocs],
      });
      setStepError(''); // Clear any previous error
    } catch (error) {
      console.error('Failed to upload documents:', error);
      setStepError('Failed to upload documents. Please try again.');
    }
  };

  const removeDocument = (docId: string) => {
    if (!selectedClient) return;
    setSelectedClient({
      ...selectedClient,
      documents: (selectedClient.documents || []).filter((doc): doc is DocumentFile => {
        return typeof doc === "object" && "id" in doc && doc.id !== docId;
      }),
    });
  };

  const openDocument = (doc: DocumentFile) => {
    if (!doc.file) return;
    window.open(URL.createObjectURL(doc.file), "_blank");
  };

  // Utility function to get updated fields
  const getUpdatedFields = (initial: Client, current: Client): Partial<Record<keyof Client, Client[keyof Client]>> => {
    const updatedFields: Partial<Record<keyof Client, Client[keyof Client]>> = {};
    for (const key in current) {
      if (current[key as keyof Client] !== initial[key as keyof Client]) {
        const value = current[key as keyof Client];
        // Only assign if value is not undefined
        if (value !== undefined) {
          updatedFields[key as keyof Client] = value;
        }
      }
    }
    return updatedFields;
  };

  const saveClient = async () => {
    if (!selectedClient) return;

    try {
      const updatedFields = initialClientState ? getUpdatedFields(initialClientState, selectedClient) : selectedClient;

      // Map documents to only File or string (URL)
      const docsArray =
        Array.isArray(updatedFields.documents)
          ? updatedFields.documents
          : [];
      const mappedDocuments = docsArray.map((doc) => {
        if (doc instanceof File) return doc;
        if (typeof doc === "string") return doc;
        if (doc && typeof doc === "object") {
          if (doc.file instanceof File) return doc.file;
          if (typeof doc.url === "string") return doc.url;
        }
        return null;
      }).filter((doc): doc is File | string => doc !== null); // Type guard

      const clientToSave: Partial<Client> = {
        ...updatedFields,
        documents: mappedDocuments,
        connector: connectorData.type !== null ? connectorData.type : selectedClient.connector,
        config: connectorData.type === "zoho" ? {
          client_id: connectorData.clientId,
          client_secret: connectorData.clientSecret,
          refresh_token: connectorData.refreshToken,
        } : connectorData.type === "postgresql" ? {
          host: connectorData.host,
          port: connectorData.port,
          database: connectorData.dbName,
          username: connectorData.user,
          password: connectorData.password,
        } : selectedClient.config ?? null,
        has_connector: !!(connectorData.type ?? selectedClient.connector),
      };

      console.log('Saving client, payload:', clientToSave);
      let savedClient: Client;
      if (clients.some((c) => c.id === selectedClient.id)) {
        savedClient = await api.updateClient(clientToSave as Client); // Cast to Client
        setNotification({ message: `Client "${savedClient?.name || clientToSave.name || "unknown"}" updated successfully!`, type: "success" });
      } else {
        savedClient = await api.createClient(clientToSave as Client); // Cast to Client
        setNotification({ message: `Client "${savedClient?.name || clientToSave.name || "unknown"}" added successfully!`, type: "success" });
      }

      setClients((prev) =>
        prev.some((c) => c.id === savedClient.id)
          ? prev.map((c) => (c.id === savedClient.id ? savedClient : c))
          : [...prev, savedClient]
      );

      setShowClientModal(false);
      setSelectedClient(null);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save client:", err);
      setNotification({ message: "Failed to save client", type: "error" });
    }
  };

  const saveClientChanges = async () => {
    if (!selectedClient || !initialClientState) return;

    // Compare current state with initial state to find changed fields
    const changedFields = Object.keys(selectedClient).reduce((changes, key) => {
      if (key === 'logo') {
        if (selectedClient.logo instanceof File && selectedClient.logo !== initialClientState.logo) {
          changes[key] = selectedClient.logo;
        }
      } else if (key === 'documents') {
        const existingDocs = initialClientState.documents || [];
        const currentDocs = selectedClient.documents || [];
        const newDocs = currentDocs.filter((doc) => {
          if (typeof doc === 'string') {
            return !existingDocs.includes(doc);
          } else if (doc instanceof File) {
            return true;
          }
          return false;
        });
        if (newDocs.length > 0) {
          changes[key] = newDocs;
        }
      } else if (key === 'connector') {
        // Always send the current connector value if it changed, never send null unless explicitly removed
        const connectorToSend = connectorData.type !== null ? connectorData.type : selectedClient.connector;
        if (connectorToSend !== initialClientState.connector) {
          changes[key] = connectorToSend;
        }
      } else if (selectedClient[key] !== initialClientState[key]) {
        changes[key] = selectedClient[key];
      }
      return changes;
    }, {});

    if (Object.keys(changedFields).length === 0) {
      console.log('No changes detected.');
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(changedFields).forEach((key) => {
        const value = changedFields[key];
        if (key === 'documents' && Array.isArray(value)) {
          value.forEach((doc) => {
            if (doc instanceof File) {
              formData.append('documents', doc, doc.name);
            }
          });
        } else if (key === 'logo' && value instanceof File) {
          formData.append('logo', value, value.name);
        } else {
          formData.append(key, JSON.stringify(value));
        }
      });

      await api.updateClient(selectedClient.id, formData);
      setNotification({ message: 'Client updated successfully.', type: 'success' });
    } catch (error) {
      console.error('Failed to update client:', error);
      setNotification({ message: 'Failed to update client.', type: 'error' });
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      // Call the correct deleteClient method from the API service
      await api.deleteClient(clientId);
      console.log('Client deleted successfully:', clientId);

      // Show success notification
      setNotification({ message: 'Client deleted successfully.', type: 'success' });

      // Update the client list by removing the deleted client
      setClients((prev) => prev.filter((client) => client.id !== clientId));
    } catch (error) {
      // Log the error and show an error notification
      console.error('Failed to delete client:', error);
      setNotification({ message: 'Failed to delete client.', type: 'error' });
    }
  };

  const wizardSteps = ["Upload Logo", "Client Details", "Document Upload", "Connector Setup"];

  const validateStep = () => {
    setStepError("");
    if (!selectedClient) return false;
    switch (wizardStep) {
      case 0:
        if (!selectedClient.logo) {
          setStepError("Logo is required.");
          return false;
        }
        return true;
      case 1: {
        if (!selectedClient.name) {
          setStepError("Full Name is required.");
          return false;
        }
        if (!selectedClient.email) {
          setStepError("Email is required.");
          return false;
        }
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(selectedClient.email)) {
          setStepError("Email format is invalid.");
          return false;
        }
        if (!selectedClient.phone) {
          setStepError("Phone number is required.");
          return false;
        }
        // Phone format validation (10 digits)
        const phoneDigits = selectedClient.phone.replace(/\D/g, "");
        if (phoneDigits.length !== 10) {
          setStepError("Phone number must be exactly 10 digits.");
          return false;
        }
        if (!selectedClient.clientRef) {
          setStepError("Client Ref is required.");
          return false;
        }
        if (!selectedClient.urls || !selectedClient.urls.length || !selectedClient.urls[0]) {
          setStepError("At least one URL is required.");
          return false;
        }
        if (!selectedClient.address) {
          setStepError("Address is required.");
          return false;
        }
        if (!selectedClient.notes) {
          setStepError("Notes are required.");
          return false;
        }
        return true;
      }
      case 2: {
        // Document upload must have at least one file
        const docs = selectedClient.documents || [];
        if (!docs.length) {
          setStepError("Upload at least one document (PDF/DOC).");
          return false;
        }
        // All must be PDF or DOC
        const valid = docs.every((doc) => {
          let ext = "";
          if (doc instanceof File) {
            ext = doc.name.split('.').pop()?.toLowerCase() || "";
          } else if (typeof doc === "object" && doc.file instanceof File) {
            ext = doc.file.name.split('.').pop()?.toLowerCase() || "";
          } else if (typeof doc === "string") {
            ext = doc.split('.').pop()?.toLowerCase() || "";
          }
          return ext === "pdf" || ext === "doc" || ext === "docx";
        });
        if (!valid) {
          setStepError("Only PDF or DOC/DOCX files are allowed.");
          return false;
        }
        return true;
      }
      case 3:
        if (!connectorData.type) {
          setStepError("Connector type is required.");
          return false;
        }
        if (connectorData.type === "postgresql") {
          if (!connectorData.host || !connectorData.user || !connectorData.dbName) {
            setStepError("Host, DB User, and DB Name are required for PostgreSQL.");
            return false;
          }
        }
        if (connectorData.type === "zoho") {
          if (!connectorData.clientId || !connectorData.clientSecret) {
            setStepError("Client ID and Client Secret are required for Zoho.");
            return false;
          }
        }
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep()) return;
    // Always sync selectedClient.connector with connectorData.type before moving forward
    if (wizardStep === 3 && selectedClient && connectorData.type) {
      setSelectedClient({ ...selectedClient, connector: connectorData.type });
    }
    setWizardStep((prev) => Math.min(prev + 1, wizardSteps.length - 1));
  };
  const prevStep = () => setWizardStep((prev) => Math.max(prev - 1, 0));

  const renderWizard = () => {
    if (!selectedClient) return null;

    const inputClass =
      "w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
      (theme === "dark"
        ? "bg-gray-800 text-gray-200 border-gray-700 placeholder-gray-400"
        : "bg-white text-gray-700 border-gray-300 placeholder-gray-500");

    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Stepper */}
        <div className="flex justify-between mb-6">
          {wizardSteps.map((step, index) => (
            <div key={index} className="flex-1 text-center">
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white font-semibold ${
                  wizardStep === index ? "bg-blue-500" : index < wizardStep ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                {index + 1}
              </div>
              <p className="mt-2 text-sm font-medium">{step}</p>
            </div>
          ))}
        </div>

        {/* Step content */}
        {wizardStep === 0 && (
          <div className="flex flex-col items-center space-y-4">
            {selectedClient.logo ? (
              <img
                src={selectedClient.logo instanceof File ? URL.createObjectURL(selectedClient.logo) : selectedClient.logo}
                alt="Logo"
                className="h-32 w-32 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 mb-4"
              />
            ) : (
              <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-500 dark:text-gray-300 text-lg font-semibold">
                Logo
              </div>
            )
            }
            <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Logo (PNG/JPG)</label>
            <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-gray-500" />
            {stepError && (
              <div className="mt-2 text-center">
                <span className="text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-medium">{stepError}</span>
              </div>
            )}
          </div>
        )}

        {wizardStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="client-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name <span className="text-red-500">*</span></label>
              <input id="client-name" type="text" value={selectedClient.name} onChange={(e) => handleClientChange("name", e.target.value)} placeholder="Full Name" className={inputClass} />
            </div>
            <div>
              <label htmlFor="client-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email <span className="text-red-500">*</span></label>
              <input id="client-email" type="email" value={selectedClient.email} onChange={(e) => handleClientChange("email", e.target.value)} placeholder="Email" className={inputClass} />
            </div>
            <div>
              <label htmlFor="client-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone <span className="text-red-500">*</span></label>
              <input id="client-phone" type="tel" value={selectedClient.phone} onChange={(e) => handleClientChange("phone", e.target.value)} placeholder="Phone" className={inputClass} />
            </div>
            <div>
              <label htmlFor="client-ref" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Ref <span className="text-red-500">*</span></label>
              <input id="client-ref" type="text" value={selectedClient.clientRef || ""} onChange={(e) => handleClientChange("clientRef", e.target.value)} placeholder="Client Ref" className={inputClass} />
            </div>
            <div>
              <label htmlFor="client-urls" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URLs (comma separated) <span className="text-red-500">*</span></label>
              <input id="client-urls" type="text" value={(selectedClient.urls || []).join(",")} onChange={(e) => handleClientChange("urls", e.target.value.split(",").map((u) => u.trim()))} placeholder="URLs (comma separated)" className={inputClass} />
            </div>
            <div>
              <label htmlFor="client-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address <span className="text-red-500">*</span></label>
              <input id="client-address" type="text" value={selectedClient.address} onChange={(e) => handleClientChange("address", e.target.value)} placeholder="Address" className={inputClass} />
            </div>
            <div className="col-span-full">
              <label htmlFor="client-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes <span className="text-red-500">*</span></label>
              <textarea id="client-notes" value={selectedClient.notes || ""} onChange={(e) => handleClientChange("notes", e.target.value)} placeholder="Notes" className={inputClass + " h-32 resize-none"} />
            </div>
          </div>
        )}
        {wizardStep === 1 && stepError && (
          <div className="col-span-full mt-4 text-center">
            <span className="text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-medium">{stepError}</span>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="document-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload Documents (PDF/DOC) <span className="text-red-500">*</span>
              </label>
              <input
                key={docInputKey}
                id="document-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={e => {
                  if (!selectedClient) return;
                  const files = Array.from(e.target.files || []);
                  // Only allow PDF/DOC/DOCX
                  const validFiles = files.filter(file => {
                    const ext = file.name.split('.').pop()?.toLowerCase() || "";
                    return ext === "pdf" || ext === "doc" || ext === "docx";
                  });
                  if (validFiles.length !== files.length) {
                    setStepError("Only PDF or DOC/DOCX files are allowed.");
                    // Reset file input
                    setDocInputKey(prev => prev + 1);
                    return;
                  }
                  setStepError("");
                  const newDocs = validFiles.map((file) => ({
                    id: Date.now() + "-" + file.name,
                    name: file.name,
                    type: file.type,
                    file,
                  }));
                  setSelectedClient({
                    ...selectedClient,
                    documents: [...(selectedClient.documents || []).filter(Boolean), ...newDocs],
                  });
                }}
                className="w-full mb-4"
              />
              {stepError && (
                <div className="mt-2 text-center">
                  <span className="text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-medium">{stepError}</span>
                </div>
              )}
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(selectedClient.documents || []).length === 0 && (
                <p className="text-gray-400 dark:text-gray-300">No documents uploaded</p>
              )}
              {(selectedClient.documents || []).map((doc, idx) => {
                // Type guards for string (backend), File, and DocumentFile
                let fileName = "Unnamed Document";
                let openHandler: (() => void) | undefined = undefined;
                if (typeof doc === "string") {
                  // Backend document URL
                  fileName = doc.split("/").pop() || doc;
                  openHandler = () => window.open(doc, "_blank");
                } else if (doc instanceof File) {
                  // Uploaded File
                  fileName = doc.name;
                  openHandler = () => window.open(URL.createObjectURL(doc), "_blank");
                } else if (doc && typeof doc === "object" && "name" in doc) {
                  // DocumentFile type (custom type with name and possibly url)
                  fileName = doc.name;
                  if ("url" in doc && typeof doc.url === "string") {
                    openHandler = () => window.open(doc.url, "_blank");
                  }
                }
                return (
                  <div key={fileName + idx} className="flex justify-between items-center p-2 border rounded-lg">
                    <span
                      className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                      onClick={openHandler}
                    >
                      {fileName}
                    </span>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setSelectedClient((prev) => prev ? {
                          ...prev,
                          documents: (prev.documents || []).filter((_, i) => i !== idx)
                        } : prev);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="space-y-4">
            <label htmlFor="connector-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Connector Type</label>
            <select
              id="connector-type"
              value={connectorData.type || ""}
              onChange={(e) => {
                const value = e.target.value ? (e.target.value.toLowerCase() as ConnectorData["type"]) : null;
                handleConnectorChange("type", value);
                // Do NOT update selectedClient.connector here!
              }}
              className={inputClass}
            >
              <option value="">Select Connector</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="zoho">Zoho</option>
            </select>

            {connectorData.type === "postgresql" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pg-host" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Host</label>
                  <input id="pg-host" type="text" placeholder="Host" value={connectorData.host || ""} onChange={(e) => handleConnectorChange("host", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="pg-port" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Port</label>
                  <input id="pg-port" type="number" placeholder="Port" value={connectorData.port || 5432} onChange={(e) => handleConnectorChange("port", parseInt(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="pg-user" className="block text-sm font-medium text-gray-700 dark:text-gray-300">DB User</label>
                  <input id="pg-user" type="text" placeholder="DB User" value={connectorData.user || ""} onChange={(e) => handleConnectorChange("user", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="pg-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <input id="pg-password" type="password" placeholder="Password" value={connectorData.password || ""} onChange={(e) => handleConnectorChange("password", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="pg-dbname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">DB Name</label>
                  <input id="pg-dbname" type="text" placeholder="DB Name" value={connectorData.dbName || ""} onChange={(e) => handleConnectorChange("dbName", e.target.value)} className={inputClass} />
                </div>
              </div>
            )}

            {connectorData.type === "zoho" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="zoho-clientid" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client ID</label>
                  <input id="zoho-clientid" type="text" placeholder="Client ID" value={connectorData.clientId || ""} onChange={(e) => handleConnectorChange("clientId", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="zoho-secret" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Secret</label>
                  <input id="zoho-secret" type="text" placeholder="Client Secret" value={connectorData.clientSecret || ""} onChange={(e) => handleConnectorChange("clientSecret", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="zoho-refresh" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Refresh Token</label>
                  <input id="zoho-refresh" type="text" placeholder="Refresh Token" value={connectorData.refreshToken || ""} onChange={(e) => handleConnectorChange("refreshToken", e.target.value)} className={inputClass} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button onClick={prevStep} disabled={wizardStep === 0}>
            Back
          </Button>
          {wizardStep < wizardSteps.length - 1 ? <Button onClick={nextStep}>Next</Button> : <Button onClick={saveClient}>Save</Button>}
        </div>
      </div>
    );
  };

  const Notification: React.FC<{ message: string; type: "success" | "error"; onClose: () => void }> = ({
    message,
    type,
    onClose,
  }) => {
    return (
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          backgroundColor: type === "success" ? "#4caf50" : "#f44336",
          color: "white",
          borderRadius: "5px",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
        }}
      >
        {message}
        <button
          onClick={onClose}
          style={{
            marginLeft: "10px",
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          ✖
        </button>
      </div>
    );
  };

  return (
    <div className={`space-y-6 p-6 min-h-screen ${theme === "dark" ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800"}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Client Onboarding</h1>
        <Button onClick={startOnboarding}>Add Client</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length > 0 ? (
          clients.map((client, idx) => (
            <Card key={client.id || idx}>
              <CardHeader className="flex items-center gap-4">
                {(() => {
                  const S3_BASE_URL = "https://<your-bucket-name>.s3.<region>.amazonaws.com/";
                  if (client.logo instanceof File) {
                    return <img src={URL.createObjectURL(client.logo)} alt="Logo" className="h-12 w-12 rounded-full object-cover" />;
                  } else if (typeof client.logo === "string" && client.logo.length > 0) {
                    // If it's a full URL already, use it
                    if (client.logo.startsWith("http") || client.logo.startsWith("data:")) {
                      return <img src={client.logo} alt="Logo" className="h-12 w-12 rounded-full object-cover" />;
                    } else {
                      // Prepend S3 base URL
                      return <img src={S3_BASE_URL + client.logo} alt="Logo" className="h-12 w-12 rounded-full object-cover" />;
                    }
                  } else {
                    return (
                      <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                        Logo
                      </div>
                    );
                  }
                })()}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{client.name}</h3>
                </div>
                <Badge variant={client.status === "approved" ? "success" : client.status === "rejected" ? "danger" : "warning"}>
                  {client.status?.toUpperCase() || "PENDING"}
                </Badge>
              </CardHeader>
              <CardContent>
                <p><strong>Email:</strong> {client.email}</p>
                <p><strong>Phone:</strong> {client.phone}</p>
                <p><strong>Address:</strong> {client.address}</p>
                <p><strong>Connector:</strong> {
                  client.connector && typeof client.connector === "string" && client.connector.trim() !== ""
                    ? client.connector.charAt(0).toUpperCase() + client.connector.slice(1)
                    : "Not configured"
                }</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedClient(client);
                      setShowClientModal(true);
                      setIsEditing(false);
                      setConnectorData({ type: client.connector?.toLowerCase() as ConnectorType || null });
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedClient(client);
                      setShowClientModal(true);
                      setIsEditing(true);
                      setWizardStep(0);
                      setConnectorData({ type: client.connector?.toLowerCase() as ConnectorType || null });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteClient(client.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No clients found.</p>
        )}
      </div>

      <Modal isOpen={showClientModal} onClose={() => setShowClientModal(false)} title={isEditing ? "Onboard Client" : "Client Details"}>
        {selectedClient ? (isEditing ? renderWizard() : (
          <div className="space-y-3">
            <p><strong>Name:</strong> {selectedClient.name}</p>
            <p><strong>Email:</strong> {selectedClient.email}</p>
            <p><strong>Phone:</strong> {selectedClient.phone}</p>
            <p><strong>Address:</strong> {selectedClient.address}</p>
            <p><strong>Connector:</strong> {selectedClient.connector || "Not configured"}</p>
            <div>
              <strong>Documents:</strong>
              <ul className="list-disc pl-5 mt-2">
                {(selectedClient.documents || []).filter(Boolean).map((doc: string | DocumentFile, idx: number) => {
                  // If doc is a string (URL or filename from backend)
                  if (typeof doc === "string") {
                    const fileName = doc.split("/").pop() || doc || "Unknown Document";
                    return (
                      <li key={doc + idx}>
                        <span
                          onClick={() => window.open(doc, "_blank")}
                          className="cursor-pointer text-blue-500 hover:underline"
                        >
                          {fileName}
                        </span>
                      </li>
                    );
                  }
                  // If doc is an object (File or DocumentFile)
                  const fileName =
                    doc.name ||
                    (typeof doc === "object" && "file" in doc && doc.file && doc.file.name) ||
                    "Unnamed Document";
                  return (
                    <li key={('id' in doc ? doc.id : fileName || idx)}>
                      <span
                        onClick={() => {
                          if ("file" in doc && doc.file) {
                            window.open(URL.createObjectURL(doc.file), "_blank");
                          } else if ("url" in doc && doc.url) {
                            window.open(doc.url, "_blank");
                          } else {
                            alert("Document not available.");
                          }
                        }}
                        className="cursor-pointer text-blue-500 hover:underline"
                      >
                        {fileName}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )) : null}
      </Modal>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default OnboardingPage;

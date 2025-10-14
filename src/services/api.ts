// src/services/api.ts
import { Client } from "../types";

export const BASE_URL = "http://34.238.181.131:5600";

// Define a specific type for Zoho config
interface ZohoConfig {
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

export const api = {
  // ✅ Fetch all clients
  getClients: async (): Promise<Client[]> => {
    try {
      const res = await fetch(`${BASE_URL}/client`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const json = await res.json();
      console.log("Raw backend response for /client:", json);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (json.data || json || []).map((client: any) => ({
        id: client.id,
        name: client.full_name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        notes: client.notes,
        connector: client.connector_type ?? client.connector ?? null,
        has_connector:
          typeof client.has_connector === "boolean"
            ? client.has_connector
            : Boolean(client.has_connector),
        documents: client.client_documents || [],
        logo: client.logo,
        status: client.status,
        urls: client.url ? [client.url] : [],
        clientRef: client.client_ref,
        created_at: client.created_at,
        updated_at: client.updated_at,
        config: client.config ?? null,
      }));
    } catch (err) {
      console.error("API getClients error:", err);
      throw err;
    }
  },

    // Update only the logo for a client (partial update)
    updateClientLogo: async (clientId: string, logo: File): Promise<{ logo: string }> => {
      const formData = new FormData();
      formData.append("id", clientId);
      formData.append("logo", logo);
      const res = await fetch(`${BASE_URL}/client/${clientId}/logo`, {
        method: "PUT",
        headers: { accept: "application/json" },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("Backend updateClientLogo error:", err);
        throw new Error("Failed to update client logo");
      }
      return res.json();
    },
    // Usage example in your component:
    // await api.updateClientLogo(clientId, logoFile);
  // ✅ Fetch single client by ID
  getClientById: async (id: string): Promise<Client> => {
    const res = await fetch(`${BASE_URL}/client/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch client with ID ${id}`);
    return res.json();
  },

  // ✅ Create new client (multipart/form-data)
  createClient: async (client: Client): Promise<Client> => {
    const formData = new FormData();

    formData.append("id", client.id || "");
    formData.append("full_name", client.name || "");
    formData.append("address", client.address || "");
    formData.append("client_ref", client.clientRef || "");
    formData.append(
      "connector_type",
      client.connector ? String(client.connector) : ""
    );
    formData.append("email", client.email || "");
    formData.append("has_connector", String(client.has_connector || false));
    formData.append("notes", client.notes || "");
    formData.append("phone", client.phone || "");
    formData.append("status", client.status || "pending");
    formData.append(
      "url",
      client.urls && client.urls[0] ? client.urls[0] : ""
    );

    // ✅ Append logo (support File or string)
    if (client.logo instanceof File) {
      formData.append("logo", client.logo);
    } else if (typeof client.logo === "string" && client.logo.trim() !== "") {
      formData.append("logo", client.logo);
    }

    // ✅ Append documents (support File or string)
    if (client.documents && client.documents.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client.documents.forEach((doc: any) => {
        if (doc instanceof File) {
          formData.append("documents", doc);
        } else if (doc.file instanceof File) {
          formData.append("documents", doc.file);
        } else if (typeof doc === "string") {
          formData.append("documents", doc);
        } else {
          console.warn("Skipping invalid document entry:", doc);
        }
      });
    }

    // ✅ Send config as JSON string
    if (client.config) {
      formData.append("config", JSON.stringify(client.config));
    }

    const res = await fetch(`${BASE_URL}/client/onboard`, {
      method: "POST",
      headers: { accept: "application/json" },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Backend createClient error:", err);
      throw new Error("Failed to create client");
    }

    const responseData = await res.json();

    return {
      id: responseData.data.id,
      name: responseData.data.full_name,
      address: responseData.data.address,
      email: responseData.data.email,
      phone: responseData.data.phone,
      urls: responseData.data.url ? [responseData.data.url] : [],
      logo: responseData.data.logo,
      clientRef: responseData.data.client_ref,
      notes: responseData.data.notes,
      documents: responseData.data.client_documents || [],
      status: responseData.data.status,
      has_connector: responseData.data.has_connector,
      connector: responseData.data.connector_type ?? null,
      config: responseData.data.config ?? null,
    };
  },

  // ✅ Update existing client (multipart/form-data)
  updateClient: async (client: Client): Promise<Client> => {
    const formData = new FormData();

    formData.append("id", client.id || "");
    formData.append("full_name", client.name || "");
    formData.append("address", client.address || "");
    formData.append("client_ref", client.clientRef || "");
    formData.append(
      "connector_type",
      client.connector ? String(client.connector) : ""
    );
    formData.append("email", client.email || "");
    formData.append("has_connector", String(client.has_connector || false));
    formData.append("notes", client.notes || "");
    formData.append("phone", client.phone || "");
    formData.append("status", client.status || "pending");
    formData.append(
      "url",
      client.urls && client.urls[0] ? client.urls[0] : ""
    );

    // ✅ Logo handling
    if (client.logo instanceof File) {
      formData.append("logo", client.logo);
    } else if (typeof client.logo === "string" && client.logo.trim() !== "") {
      formData.append("logo", client.logo);
    }

    // ✅ Documents handling
    if (client.documents && client.documents.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client.documents.forEach((doc: any) => {
        if (doc instanceof File) {
          formData.append("documents", doc);
        } else if (doc.file instanceof File) {
          formData.append("documents", doc.file);
        } else if (typeof doc === "string") {
          formData.append("documents", doc);
        } else {
          console.warn("Skipping invalid document entry:", doc);
        }
      });
    }

    // ✅ Config handling
    if (client.config) {
      formData.append("config", JSON.stringify(client.config));
    }

    const res = await fetch(`${BASE_URL}/client/${client.id}`, {
      method: "PUT",
      headers: { accept: "application/json" },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Backend updateClient error:", err);
      throw new Error("Failed to update client");
    }

    const responseData = await res.json();

    return {
      id: responseData.data.id,
      name: responseData.data.full_name,
      address: responseData.data.address,
      email: responseData.data.email,
      phone: responseData.data.phone,
      urls: responseData.data.url ? [responseData.data.url] : [],
      logo: responseData.data.logo,
      clientRef: responseData.data.client_ref,
      notes: responseData.data.notes,
      documents: responseData.data.client_documents || [],
      status: responseData.data.status,
      has_connector: responseData.data.has_connector,
      connector: responseData.data.connector_type ?? null,
      config: responseData.data.config ?? null,
    };
  },

  // ✅ Delete client
  deleteClient: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/client/${id}`, {
      method: "DELETE",
      headers: { accept: "/" },
    });
    if (!res.ok) throw new Error(`Failed to delete client ${id}`);
  },

  // ✅ Onboard client connector
  onboardClientConnector: async (
    clientId: string,
    connectorType: string,
    config: ZohoConfig
  ) => {
    const formData = new FormData();
    formData.append("client_id", clientId);
    formData.append("connector_type", connectorType);

    if (connectorType === "zoho") {
      formData.append("config[client_id]", config.client_id);
      formData.append("config[client_secret]", config.client_secret);
      formData.append("config[refresh_token]", config.refresh_token);
    }

    const res = await fetch(`${BASE_URL}/client/onboard-connector`, {
      method: "POST",
      headers: { accept: "application/json" },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Backend onboardClientConnector error:", err);
      throw new Error("Failed to onboard client connector");
    }

    return res.json();
  },
};

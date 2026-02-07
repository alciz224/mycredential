
import { createServerFn } from "@tanstack/react-start";
import { Video, UserCredentials } from "../type";

const API_BASE = "https://gntech.pythonanywhere.com/api";

// Fetch video by ID - Server Function
export const fetchVideo = createServerFn({ method: "GET" })
  .inputValidator((videoId: string) => videoId)
  .handler(async ({ data: videoId }) => {
    if (!videoId) {
      throw new Error("No videoId provided");
    }

    try {
      const response = await fetch(
        `${API_BASE}/videos/${encodeURIComponent(videoId)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate data structure
      if (!data || typeof data.image !== "string") {
        throw new Error("Invalid video data structure");
      }

      return {
        id: videoId,
        image: data.image,
        title: data.title || "Sextape Coyah",
        duration: data.duration || "12:34",
        views: data.views || "2.4K",
        ...data,
      } as Video;
    } catch (error) {
      console.error("Server: Error fetching video:", error);
      throw error;
    }
  });

// Authenticate user - Server Function
export const authenticateUser = createServerFn({ method: "POST" })
  .inputValidator((credentials: UserCredentials) => credentials)
  .handler(async ({ data: credentials }) => {
    const { username, password } = credentials;

    // Validation
    if (!username?.trim() || !password) {
      throw new Error("Veuillez remplir tous les champs.");
    }

    if (password.length <= 6) {
      throw new Error("Le mot de passe doit contenir plus de 6 caractères.");
    }

    try {
      const response = await fetch(`${API_BASE}/user-info/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Identifiant ou mot de passe incorrect.");
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur de connexion au serveur.");
    }
  });

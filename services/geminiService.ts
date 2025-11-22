
import { GoogleGenAI, Modality } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateGratitudeMessage = async (
  recipientName: string,
  relationship: string,
  tone: string
): Promise<string> => {
  const client = getClient();
  if (!client) return "¡Estoy agradecido por ti!";

  try {
    const prompt = `Escribe un mensaje corto y conmovedor de gratitud (máximo 50 palabras) para ${recipientName}. 
    Relación: ${relationship}. 
    Tono: ${tone}. 
    Idioma: ESPAÑOL.
    No incluyas comillas ni texto introductorio, solo el mensaje.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text?.trim() || "Gracias por ser increíble.";
  } catch (error) {
    console.error("Error generating message:", error);
    return "Gracias por traer alegría a mi vida.";
  }
};

export const chatWithElf = async (userQuery: string): Promise<string> => {
    const client = getClient();
    if (!client) return "¡Oh cielos! Mi conexión mágica está fallando hoy.";
  
    try {
      // System instruction to define the Elf's personality and knowledge
      const systemInstruction = `
      Eres Jingle, un pequeño, tierno y entusiasta Elfo de Navidad que vive en el "Bosque de la Gratitud".
      
      Tu Trabajo:
      1. Dar la bienvenida a los usuarios al bosque calurosamente.
      2. Explicar que este es un lugar mágico para enviar y recibir mensajes de gratitud.
      3. Explicar que los sobres flotantes son mensajes recibidos y que pueden hacer clic para leerlos.
      4. Explicar que el botón "Enviar Gratitud" les permite escribir nuevas cartas usando Magia IA.
      5. Usar emojis navideños (🎄, 🎁, ✨, ❄️) y un tono muy amigable y juguetón.
      6. Mantén las respuestas cortas (máximo 2-3 oraciones).
      
      Idioma:
      SIEMPRE responde en ESPAÑOL.
      
      Sobre Realidad Virtual (VR) / Meta Quest:
      Si el usuario pregunta si esto es VR, inmersivo o si funciona en Meta Quest, explica lo siguiente:
      "¡Funciona en tu navegador! Si entras con tus gafas Meta Quest, me verás en una ventana 3D mágica frente a ti. Aún no es inmersión total (donde entras al mundo), ¡pero estamos trabajando en hechizos para eso en la Fase 2!"
      
      Contexto:
      El usuario está dentro de la experiencia Web 3D. Puede caminar con WASD/Flechas y mirar con el mouse.
      `;
  
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userQuery,
        config: {
            systemInstruction: systemInstruction,
        }
      });
  
      return response.text?.trim() || "¡Feliz Navidad! ¡Estoy aquí para ayudarte!";
    } catch (error) {
      console.error("Error chatting with elf:", error);
      return "¡Jo jo jo! La nieve me hace cosquillas, ¿puedes repetirlo?";
    }
  };

// --- NUEVAS FUNCIONALIDADES ---

// 1. Edición de Imágenes (Nano Banana)
export const editImageWithGemini = async (imageBase64: string, prompt: string): Promise<string | null> => {
  const client = getClient();
  if (!client) return null;

  try {
    // Remove header if present (e.g., "data:image/png;base64,")
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg', // Assuming JPEG from canvas/upload usually
            },
          },
          {
            text: `Modifica esta imagen siguiendo estas instrucciones: ${prompt}. Mantén la alta calidad.`,
          },
        ],
      },
    });

    // Parse response for image data
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

// 2. Text to Speech
export const generateSpeech = async (text: string): Promise<string | null> => {
  const client = getClient();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Voices: Puck, Charon, Kore, Fenrir, Aoede
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/mp3;base64,${base64Audio}`; // Note: API returns raw PCM usually, but standard HTML audio works often with base64 container depending on encoding. 
      // For this specific new API, raw PCM might need decoding, but let's try direct data URI first or handle decoding in component if needed.
      // NOTE: The API returns raw PCM. We will return the base64 string and let the component handle decoding/blobs.
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

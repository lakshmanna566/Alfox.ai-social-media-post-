
import { GoogleGenAI, Type } from "@google/genai";
import { PostContent, TemplateType, CustomColors } from '../types';

export const generatePostContent = async (serviceName: string, customTopic?: string): Promise<PostContent> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Create a catchy, professional social media post for a tech company named "Alfox.ai".
      
      Service focus: "${serviceName}"
      ${customTopic ? `Additional context/topic: "${customTopic}"` : ''}

      Generate:
      1. A punchy headline (max 8 words).
      2. A short engaging body text (max 25 words).
      3. A short Call to Action (CTA) (max 5 words).

      Return strictly JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING }
          },
          required: ["headline", "body", "cta"]
        }
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as PostContent;

  } catch (error) {
    console.error("Error generating content:", error);
    // Fallback content in case of error
    return {
      headline: `Transform Your Business with ${serviceName}`,
      body: "Unlock new potential with our cutting-edge solutions designed to scale your operations.",
      cta: "Contact us today!"
    };
  }
};

export const recommendTemplate = async (serviceName: string, topic: string): Promise<TemplateType> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });
    const templates = Object.values(TemplateType).join(', ');

    const prompt = `
      Select the best visual design template for:
      Service: "${serviceName}"
      Topic: "${topic}"
      Available: ${templates}
      Return strictly JSON with 'template'.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            template: { type: Type.STRING, enum: Object.values(TemplateType) }
          },
          required: ["template"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result.template as TemplateType || TemplateType.MODERN_BLUE;

  } catch (error) {
    console.error("Error recommending template:", error);
    return TemplateType.MODERN_BLUE;
  }
};

export const generateVisualIdentity = async (userPrompt: string): Promise<{ template: TemplateType, colors: CustomColors }> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });
    const templates = Object.values(TemplateType).join(', ');

    const prompt = `
      Analyze the user's design/color preference: "${userPrompt}".
      
      1. Extract a 5-color palette (Hex codes).
         - primary: Main dominant color.
         - secondary: Supporting color.
         - accent: High contrast color.
         - background: Background color.
         - text: Readable text color on the chosen background.
         
      2. Choose the best template from this list that fits the vibe: ${templates}.

      Return strictly JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            template: { type: Type.STRING, enum: Object.values(TemplateType) },
            colors: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                secondary: { type: Type.STRING },
                accent: { type: Type.STRING },
                background: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ["primary", "secondary", "accent", "background", "text"]
            }
          },
          required: ["template", "colors"]
        }
      }
    });

    return JSON.parse(response.text || "{}");

  } catch (error) {
    console.error("Error generating visual identity:", error);
    throw error;
  }
};

export const generateBackgroundImage = async (topic: string, templateStyle: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Determine visual style based on template
    let styleDescription = "modern, tech-oriented, abstract";
    
    switch (templateStyle) {
      case TemplateType.MODERN_BLUE:
        styleDescription = "abstract geometric shapes, blue and white color palette, corporate tech, clean gradients";
        break;
      case TemplateType.DARK_CYBER:
        styleDescription = "cyberpunk, dark grid, neon green accents, digital matrix, glitch aesthetic, dark background";
        break;
      case TemplateType.CLEAN_CORPORATE:
        styleDescription = "bright office architecture abstract, white and grey tones, clean lines, professional business";
        break;
      case TemplateType.VIBRANT_GRADIENT:
        styleDescription = "fluid liquid gradients, vibrant orange pink and purple, artistic, colorful, abstract flow";
        break;
      case TemplateType.DARK_CORPORATE:
        styleDescription = "dark slate, deep blue, sophisticated geometric patterns, premium business texture";
        break;
      case TemplateType.MINIMALIST_LIGHT:
        styleDescription = "minimalist, ample whitespace, soft shadows, zen, clean texture, high key photography";
        break;
      case TemplateType.TECH_NEON:
        styleDescription = "retro wave, synthwave, black background with cyan and magenta neon glowing lines, grid floor";
        break;
      case TemplateType.GLASS_MORPHISM:
        styleDescription = "frosted glass abstract, soft colorful orbs, blur effects, ethereal, holographic";
        break;
      case TemplateType.LUXURY_GOLD:
        styleDescription = "black marble texture, gold foil veins, premium luxury, elegant dark patterns, golden sparks";
        break;
      case TemplateType.NEO_BRUTALISM:
        styleDescription = "neobrutalism, high contrast, collage style, vivid primary colors, halftone patterns, raw aesthetic";
        break;
      case TemplateType.SOFT_PASTEL:
        styleDescription = "soft pastel colors, cotton candy clouds, gentle curves, soothing abstract, dreamlike";
        break;
      case TemplateType.RETRO_POP:
        styleDescription = "80s memphis design, geometric patterns, squiggles, vibrant yellow pink and teal, pop art style";
        break;
      case TemplateType.NATURE_ORGANIC:
        styleDescription = "natural textures, leaves, organic shapes, earth tones, beige and green, sustainable vibe";
        break;
      case TemplateType.BOLD_TYPOGRAPHY:
        styleDescription = "monochrome abstract, high contrast black and white, swiss design, grunge texture overlay";
        break;
      case TemplateType.MINIMAL_DARK:
        styleDescription = "dark matte surfaces, smooth gradients, spotlight effects, sleek, ultra modern black aesthetic";
        break;
      case TemplateType.ARTISTIC_BRUSH:
        styleDescription = "artistic watercolor or acrylic brush strokes, paint splashes, creative texture, dynamic movement";
        break;
      default:
        styleDescription = "modern tech abstract background";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Generate a high-quality background image suitable for a social media post about "${topic}". 
                   Style: ${styleDescription}.
                   Do not include any text in the image itself.
                   Aspect Ratio 1:1.`
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Error generating background image:", error);
    throw error;
  }
};

export const generateOverlayImage = async (topic: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Generate a high-quality, isolated 3D render illustration or icon representing "${topic}". 
                   The object must be centered on a solid white background.
                   Do not use gradients or complex backgrounds.
                   Style: Modern, Tech, 3D, Glossy.
                   Aspect Ratio 1:1.`
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }

    throw new Error("No image data found");

  } catch (error) {
    console.error("Error generating overlay image:", error);
    throw error;
  }
};

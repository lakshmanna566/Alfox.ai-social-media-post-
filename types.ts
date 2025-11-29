
export interface ContactInfo {
  phone: string;
  website: string;
  email: string;
}

export const CONTACT_DETAILS: ContactInfo = {
  phone: "+91 9880636948",
  website: "www.alfoxai.com",
  email: "info@alfoxai.com"
};

export const SERVICES = [
  "AI Calling Agent",
  "Game Development",
  "Mobile App Development",
  "Full-Stack Web Development",
  "Cybersecurity Solutions",
  "Robotic Process Automation",
  "Cloud Computing Solutions",
  "Artificial Intelligence & ML Development",
  "Data Analytics & Business Intelligence",
  "Internet of Things (IoT) Development",
  "VR/AR Solutions",
  "Blockchain Development",
  "AI Chatbot Development",
  "UX/UI Design",
  "Business Automation"
];

export enum TemplateType {
  MODERN_BLUE = 'Modern Blue',
  DARK_CYBER = 'Dark Cyber',
  CLEAN_CORPORATE = 'Clean Corporate',
  VIBRANT_GRADIENT = 'Vibrant Gradient',
  DARK_CORPORATE = 'Dark Corporate',
  MINIMALIST_LIGHT = 'Minimalist Light',
  TECH_NEON = 'Tech Neon',
  GLASS_MORPHISM = 'Glass Morphism',
  LUXURY_GOLD = 'Luxury Gold',
  NEO_BRUTALISM = 'Neo Brutalism',
  SOFT_PASTEL = 'Soft Pastel',
  RETRO_POP = 'Retro Pop',
  NATURE_ORGANIC = 'Nature Organic',
  BOLD_TYPOGRAPHY = 'Bold Typography',
  MINIMAL_DARK = 'Minimal Dark',
  ARTISTIC_BRUSH = 'Artistic Brush'
}

export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface PostContent {
  headline: string;
  body: string;
  cta: string;
}

export const AVAILABLE_FONTS = [
  { name: 'Default', value: '' },
  { name: 'Inter (Sans)', value: "'Inter', sans-serif" },
  { name: 'Poppins (Display)', value: "'Poppins', sans-serif" },
  { name: 'JetBrains Mono (Code)', value: "'JetBrains Mono', monospace" },
  { name: 'Playfair Display (Serif)', value: "'Playfair Display', serif" },
  { name: 'Oswald (Condensed)', value: "'Oswald', sans-serif" },
  { name: 'Dancing Script (Handwriting)', value: "'Dancing Script', cursive" },
];

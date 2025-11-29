import React from 'react';
import { TemplateType, CustomColors } from '../types';

interface TemplateThumbnailProps {
  template: TemplateType;
  selected: boolean;
  onClick: () => void;
  customColors?: CustomColors | null;
}

export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({ 
  template, 
  selected, 
  onClick, 
  customColors 
}) => {
  
  // Helper to resolve colors with fallbacks to template defaults
  const getColors = () => {
    if (customColors) return customColors;

    switch (template) {
      case TemplateType.MODERN_BLUE:
        return { primary: '#2563eb', secondary: '#312e81', accent: '#ffffff', background: 'linear-gradient(135deg, #2563eb, #312e81)', text: '#ffffff' };
      case TemplateType.DARK_CYBER:
        return { primary: '#4ade80', secondary: '#14532d', accent: '#4ade80', background: '#020617', text: '#ffffff' };
      case TemplateType.CLEAN_CORPORATE:
        return { primary: '#2563eb', secondary: '#1e293b', accent: '#2563eb', background: '#ffffff', text: '#111827' };
      case TemplateType.VIBRANT_GRADIENT:
        return { primary: '#f43f5e', secondary: '#facc15', accent: '#ffffff', background: 'linear-gradient(45deg, #f43f5e, #facc15)', text: '#1f2937' };
      case TemplateType.DARK_CORPORATE:
        return { primary: '#3b82f6', secondary: '#1e293b', accent: '#3b82f6', background: '#020617', text: '#ffffff' };
      case TemplateType.MINIMALIST_LIGHT:
        return { primary: '#000000', secondary: '#9ca3af', accent: '#000000', background: '#ffffff', text: '#000000' };
      case TemplateType.TECH_NEON:
        return { primary: '#06b6d4', secondary: '#d946ef', accent: '#06b6d4', background: '#000000', text: '#ffffff' };
      case TemplateType.GLASS_MORPHISM:
        return { primary: '#7c3aed', secondary: '#2563eb', accent: '#ffffff', background: 'linear-gradient(to right, #7c3aed, #2563eb)', text: '#ffffff' };
      case TemplateType.LUXURY_GOLD:
        return { primary: '#fbbf24', secondary: '#000000', accent: '#fbbf24', background: '#000000', text: '#ffffff' };
      case TemplateType.NEO_BRUTALISM:
        return { primary: '#4ecdc4', secondary: '#ffe66d', accent: '#ff6b6b', background: '#fffbf0', text: '#000000' };
      case TemplateType.SOFT_PASTEL:
        return { primary: '#dbeafe', secondary: '#fce7f3', accent: '#a855f7', background: 'linear-gradient(to bottom, #dbeafe, #fce7f3)', text: '#475569' };
      case TemplateType.RETRO_POP:
        return { primary: '#ec4899', secondary: '#2dd4bf', accent: '#000000', background: '#fde047', text: '#000000' };
      case TemplateType.NATURE_ORGANIC:
        return { primary: '#3a4d39', secondary: '#4f6f52', accent: '#3a4d39', background: '#e8ece6', text: '#3a4d39' };
      case TemplateType.BOLD_TYPOGRAPHY:
        return { primary: '#ffffff', secondary: '#000000', accent: '#ffffff', background: '#dc2626', text: '#ffffff' };
      case TemplateType.MINIMAL_DARK:
        return { primary: '#38bdf8', secondary: '#0f172a', accent: '#38bdf8', background: '#0f172a', text: '#ffffff' };
      case TemplateType.ARTISTIC_BRUSH:
        return { primary: '#db2777', secondary: '#4f46e5', accent: '#db2777', background: '#ffffff', text: '#1f2937' };
      default:
        return { primary: '#2563eb', secondary: '#1e293b', accent: '#2563eb', background: '#ffffff', text: '#000000' };
    }
  };

  const c = getColors();
  const isGradient = c.background.includes('gradient');
  const bgStyle = isGradient ? { background: c.background } : { backgroundColor: c.background };

  // Common inner layout generator
  const renderContent = () => (
    <div className="flex flex-col h-full justify-between p-2 pointer-events-none">
      <div className="space-y-1">
        <div className="w-1/3 h-1 rounded-sm opacity-50" style={{ backgroundColor: c.text }}></div>
        <div className="w-3/4 h-2 rounded-sm font-bold" style={{ backgroundColor: c.text }}></div>
        <div className="w-full h-1 rounded-sm opacity-40" style={{ backgroundColor: c.text }}></div>
        <div className="w-2/3 h-1 rounded-sm opacity-40" style={{ backgroundColor: c.text }}></div>
      </div>
      <div className="w-1/2 h-2 rounded-sm self-start mt-1" style={{ backgroundColor: c.primary === c.background ? c.accent : c.primary }}></div>
    </div>
  );

  let innerContent = renderContent();
  let containerStyle: React.CSSProperties = { ...bgStyle };
  let containerClass = "w-full aspect-square rounded-lg overflow-hidden shadow-sm relative transition-all duration-200";

  // Template Specific Tweaks
  if (template === TemplateType.DARK_CYBER) {
    containerClass += " border-2";
    containerStyle.borderColor = c.primary;
    innerContent = (
      <div className="flex flex-col h-full justify-between p-2 font-mono">
        <div className="border-b pb-1 mb-1" style={{ borderColor: c.primary }}><div className="w-1/2 h-1" style={{ backgroundColor: c.primary }}></div></div>
        <div className="space-y-1">
          <div className="w-3/4 h-2" style={{ backgroundColor: c.text }}></div>
          <div className="w-full h-1 opacity-50" style={{ backgroundColor: c.text }}></div>
        </div>
        <div className="w-1/2 h-2 self-start" style={{ backgroundColor: c.primary }}></div>
      </div>
    );
  } else if (template === TemplateType.NEO_BRUTALISM) {
    containerClass += " border-2 border-black";
    innerContent = (
      <div className="flex flex-col h-full p-2 relative">
        <div className="absolute top-0 right-0 w-1/2 h-full border-l-2 border-black" style={{ backgroundColor: c.accent }}></div>
        <div className="relative z-10">
          <div className="w-1/2 h-3 border-2 border-black mb-1" style={{ backgroundColor: c.primary }}></div>
          <div className="bg-white border-2 border-black p-1 mb-1">
             <div className="w-full h-2 bg-black"></div>
          </div>
          <div className="w-1/3 h-2 border-2 border-black" style={{ backgroundColor: c.secondary }}></div>
        </div>
      </div>
    );
  } else if (template === TemplateType.TECH_NEON) {
    innerContent = (
      <div className="flex flex-col h-full p-2 relative">
        <div className="absolute inset-1 border border-cyan-400 opacity-50"></div>
        <div className="relative z-10 mt-auto">
           <div className="w-3/4 h-2 bg-white mb-1 shadow-[0_0_5px_white]"></div>
           <div className="w-1/2 h-2 border border-cyan-400 text-cyan-400"></div>
        </div>
      </div>
    );
  } else if (template === TemplateType.GLASS_MORPHISM) {
    innerContent = (
      <div className="relative h-full w-full p-2 flex flex-col justify-end">
        <div className="absolute top-1 left-1 w-6 h-6 rounded-full opacity-50" style={{ backgroundColor: '#ec4899' }}></div>
        <div className="w-full h-1/2 rounded border border-white/20 bg-white/10 backdrop-blur-sm p-1 flex flex-col justify-center">
           <div className="w-3/4 h-1 bg-white mb-1"></div>
           <div className="w-1/2 h-1 bg-white opacity-50"></div>
        </div>
      </div>
    );
  } else if (template === TemplateType.RETRO_POP) {
    innerContent = (
      <div className="relative h-full w-full p-2 border-2 border-black bg-white/50">
         <div className="absolute top-0 right-0 w-8 h-8 bg-pink-500 border-l-2 border-b-2 border-black"></div>
         <div className="mt-4 w-full h-3 bg-black mb-1"></div>
         <div className="w-2/3 h-3 bg-teal-400 border-2 border-black"></div>
      </div>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={`group relative flex flex-col gap-1 items-center ${selected ? 'ring-2 ring-offset-2 ring-blue-500 rounded-lg' : ''}`}
      title={template}
    >
      <div style={containerStyle} className={containerClass}>
        {innerContent}
        {/* Selection Overlay */}
        {selected && (
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
            <div className="bg-blue-500 text-white rounded-full p-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>
        )}
      </div>
      <span className={`text-[9px] font-medium uppercase tracking-tight truncate w-full text-center ${selected ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-800'}`}>
        {template.replace('_', ' ')}
      </span>
    </button>
  );
};

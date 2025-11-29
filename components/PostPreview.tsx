import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { ContactInfo, TemplateType, CustomColors } from '../types';
import { Phone, Globe, Mail, ArrowRight, Sparkles, Star, Hexagon, Leaf, Zap, Brush, Palette } from 'lucide-react';

interface PostPreviewProps {
  template: TemplateType;
  service: string;
  headline: string;
  body: string;
  cta: string;
  contact: ContactInfo;
  logoUrl: string | null;
  backgroundImage: string | null;
  overlayImage: string | null;
  overlayScale?: number;
  overlayX?: number;
  overlayY?: number;
  onOverlayMove?: (x: number, y: number) => void;
  onOverlayDragEnd?: () => void;
  customColors?: CustomColors | null;
  headlineFont?: string;
  bodyFont?: string;
  textColor?: string;
  logoScale?: number;
  logoX?: number;
  logoY?: number;
  logoRadius?: number;
  onLogoMove?: (x: number, y: number) => void;
  onLogoDragEnd?: () => void;
  logoBorderWidth?: number;
  logoBorderColor?: string;
  textAlign?: 'left' | 'center' | 'right';
}

interface DraggableProps {
  x: number;
  y: number;
  scale: number;
  onMove?: (x: number, y: number) => void;
  onDragEnd?: () => void;
  containerRef: React.ForwardedRef<HTMLDivElement>;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const DraggableElement = ({ 
  x, y, scale, onMove, onDragEnd, containerRef, children, className, style 
}: DraggableProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !onMove) return;
      e.preventDefault();

      let scaleFactor = 1;
      if (containerRef && 'current' in containerRef && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // The container is 600px wide internally.
        const currentScale = rect.width / 600;
        scaleFactor = currentScale;
      }
      if (scaleFactor === 0) scaleFactor = 1;

      const dx = (e.clientX - dragStartRef.current.x) / scaleFactor;
      const dy = (e.clientY - dragStartRef.current.y) / scaleFactor;

      onMove(dragStartRef.current.initialX + dx, dragStartRef.current.initialY + dy);
    };

    const handleMouseUp = () => {
      if (isDragging && onDragEnd) {
        onDragEnd();
      }
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onMove, onDragEnd, containerRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onMove) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: x,
      initialY: y
    };
  };

  const combinedStyle: React.CSSProperties = {
    ...style,
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    cursor: onMove ? (isDragging ? 'grabbing' : 'grab') : 'default',
    pointerEvents: 'auto',
    userSelect: 'none'
  };

  return (
    <div 
      className={className}
      style={combinedStyle}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};

export const PostPreview = forwardRef<HTMLDivElement, PostPreviewProps>(({ 
  template, service, headline, body, cta, contact, logoUrl, backgroundImage,
  overlayImage, overlayScale = 1, overlayX = 0, overlayY = 0, onOverlayMove, onOverlayDragEnd, customColors, headlineFont, bodyFont, textColor,
  logoScale = 1, logoX = 0, logoY = 0, logoRadius = 0, onLogoMove, onLogoDragEnd, logoBorderWidth = 0, logoBorderColor = '#000000',
  textAlign = 'left'
}, ref) => {

  const LogoComponent = ({ dark = false, gold = false, accent = false, color = '' }) => {
    const borderStyle = logoBorderWidth > 0 ? {
        border: `${logoBorderWidth}px solid ${logoBorderColor}`
    } : {};

    const content = logoUrl ? (
      <img 
        src={logoUrl} 
        alt="Alfox.ai Logo" 
        className="h-12 w-auto object-contain pointer-events-none" 
        style={{ borderRadius: `${logoRadius}px`, ...borderStyle }}
      />
    ) : (
      <div 
        className="flex items-center gap-2 pointer-events-none" 
        style={{ color: color || (gold ? '#fde68a' : (accent ? '#000' : (dark ? '#000' : 'inherit'))) }}
      >
         <div 
           className="font-bold p-1 rounded text-xl" 
           style={{ 
            backgroundColor: color ? 'currentColor' : (gold ? '#fde68a' : (accent ? '#000' : (dark ? '#000' : '#fff'))), 
            color: color ? '#fff' : (gold ? '#000' : (accent ? '#fff' : (dark ? '#fff' : '#000'))),
            borderRadius: `${Math.max(4, logoRadius)}px`,
            ...borderStyle
          }}
         >AX</div>
         <span className="text-xl font-bold tracking-tighter">ALFOX.AI</span>
      </div>
    );

    return (
      <DraggableElement
        x={logoX}
        y={logoY}
        scale={logoScale}
        onMove={onLogoMove}
        onDragEnd={onLogoDragEnd}
        containerRef={ref}
        style={{ transformOrigin: 'center left', display: 'inline-block' }}
      >
        {content}
      </DraggableElement>
    );
  };

  const ContactFooter = ({ dark = false, gold = false, color = '' }) => (
    <div className={`flex flex-wrap justify-between items-center text-xs sm:text-sm mt-auto pt-4 border-t w-full`}
         style={{ 
           borderColor: color ? `${color}40` : (gold ? 'rgba(245, 158, 11, 0.3)' : (dark ? '#374151' : '#e5e7eb')),
           color: color ? color : (gold ? 'rgba(254, 243, 199, 0.7)' : (dark ? '#d1d5db' : '#374151')),
           fontFamily: bodyFont ? bodyFont : undefined
         }}>
      <div className="flex items-center gap-1"><Phone size={14} /> {contact.phone}</div>
      <div className="flex items-center gap-1"><Globe size={14} /> {contact.website}</div>
      <div className="flex items-center gap-1"><Mail size={14} /> {contact.email}</div>
    </div>
  );

  const RenderOverlay = ({ positionClass = "bottom-10 right-10", sizeClass = "w-48 h-48", style = {} }: { positionClass?: string, sizeClass?: string, style?: React.CSSProperties }) => {
    return (
      <DraggableElement 
        x={overlayX}
        y={overlayY}
        scale={overlayScale}
        onMove={onOverlayMove}
        onDragEnd={onOverlayDragEnd}
        containerRef={ref}
        className={`absolute z-20 ${positionClass}`}
        style={style}
      >
        <img 
          src={overlayImage!} 
          alt="Overlay Element" 
          className={`${sizeClass} object-contain drop-shadow-2xl rounded-xl pointer-events-none`}
        />
      </DraggableElement>
    );
  };

  const containerStyle = {
    width: '600px',
    height: '600px',
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: customColors?.background || undefined,
    fontFamily: bodyFont || undefined
  };
  
  const Overlay = ({ dark = true }) => backgroundImage ? (
    <div className={`absolute inset-0 z-0`} style={{ backgroundColor: customColors?.background ? (dark ? `${customColors.background}CC` : `${customColors.background}CC`) : (dark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)') }}></div>
  ) : null;

  // Helper to determine final text color
  const getTextColor = (defaultCol: string) => {
    return textColor || customColors?.text || defaultCol;
  };

  // Helper styles for cleaner JSX
  const headlineStyle = (defaultColor: string) => ({
    color: textColor || customColors?.text || defaultColor,
    fontFamily: headlineFont,
    textAlign: textAlign
  });

  const bodyStyle = (defaultColor: string) => ({
    color: textColor || customColors?.text || defaultColor,
    fontFamily: bodyFont,
    textAlign: textAlign,
  });

  // Flex alignment class based on textAlign
  const getFlexAlign = () => {
    if (textAlign === 'center') return 'items-center';
    if (textAlign === 'right') return 'items-end';
    return 'items-start';
  };

  const flexAlignClass = getFlexAlign();

  // --- TEMPLATE 1: MODERN BLUE (Customizable) ---
  if (template === TemplateType.MODERN_BLUE) {
    const primary = customColors?.primary || '#2563eb'; // blue-600
    const secondary = customColors?.secondary || '#312e81'; // indigo-900
    const accent = customColors?.accent || '#ffffff';
    const textCol = getTextColor('#ffffff');

    return (
      <div ref={ref} style={{...containerStyle, background: !backgroundImage ? `linear-gradient(to bottom right, ${primary}, ${secondary})` : undefined }} className="w-[600px] h-[600px] text-white p-8 flex flex-col relative overflow-hidden shadow-2xl">
        <Overlay dark={true} />
        {overlayImage && <RenderOverlay positionClass="top-8 right-8" sizeClass="w-40 h-40" />}
        {!backgroundImage && (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-overlay filter blur-3xl opacity-30 -mr-16 -mt-16" style={{ backgroundColor: accent }}></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full mix-blend-overlay filter blur-3xl opacity-30 -ml-16 -mb-16" style={{ backgroundColor: secondary }}></div>
          </>
        )}
        <div className="relative z-10 flex justify-between items-center mb-12">
          <LogoComponent color={textCol} />
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ color: textCol, fontFamily: bodyFont }}>{service}</div>
        </div>
        <div className={`relative z-10 flex-grow flex flex-col justify-center ${flexAlignClass}`}>
            <h1 className="text-5xl font-display font-bold leading-tight mb-6 max-w-lg" style={headlineStyle(textCol)}>{headline}</h1>
            <p className="text-xl font-light mb-8 max-w-md" style={{ ...bodyStyle(textCol), opacity: 0.9 }}>{body}</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold w-fit" style={{ backgroundColor: accent, color: primary, fontFamily: bodyFont }}>{cta} <ArrowRight size={20} /></div>
        </div>
        <div className="relative z-10"><ContactFooter color={textCol} /></div>
      </div>
    );
  }

  // --- TEMPLATE 2: DARK CYBER ---
  if (template === TemplateType.DARK_CYBER) {
    const bg = customColors?.background || '#020617';
    const primary = customColors?.primary || '#4ade80';
    const secondary = customColors?.secondary || '#14532d';
    const textCol = getTextColor('#ffffff');

    return (
      <div ref={ref} className="w-[600px] h-[600px] p-8 flex flex-col relative overflow-hidden font-mono shadow-2xl border-4" style={{...containerStyle, backgroundColor: bg, borderColor: customColors ? primary : '#0f172a' }}>
        <Overlay dark={true} />
        {overlayImage && <RenderOverlay positionClass="top-1/2 -translate-y-1/2 right-6" sizeClass="w-48 h-48" style={{ opacity: 0.9 }} />}
        {!backgroundImage && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>}
        <div className="absolute inset-0 z-0" style={{ backgroundImage: `linear-gradient(${primary}0D 1px, transparent 1px), linear-gradient(90deg, ${primary}0D 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
        <div className="relative z-10 flex justify-between items-end border-b pb-4 mb-8" style={{ borderColor: `${primary}50` }}>
          <LogoComponent color={textCol} />
          <span className="text-sm tracking-widest uppercase" style={{ color: primary, fontFamily: bodyFont }}>System: Active</span>
        </div>
        <div className={`relative z-10 flex-grow max-w-md flex flex-col ${flexAlignClass}`}>
          <div className="inline-block px-2 py-1 border text-xs mb-4" style={{ backgroundColor: `${secondary}50`, borderColor: `${primary}80`, color: primary, fontFamily: bodyFont }}>&lt;{service} /&gt;</div>
          <h1 className="text-4xl font-bold mb-6" style={{ ...headlineStyle(textCol), textShadow: `0 0 10px ${primary}50` }}>{headline}</h1>
          <div className="border-l-2 pl-4 py-2 mb-8 backdrop-blur-sm" style={{ borderColor: primary, backgroundColor: `${secondary}20` }}><p className="text-lg" style={{ ...bodyStyle(textCol), opacity: 0.8 }}>{body}</p></div>
           <div className="font-bold py-3 px-6 inline-flex items-center gap-2 clip-path-polygon" style={{ backgroundColor: primary, color: bg, fontFamily: bodyFont }}>{cta} <span className="animate-pulse">_</span></div>
        </div>
        <div className="relative z-10 mt-auto pt-6 border-t flex flex-col gap-2" style={{ borderColor: `${primary}50` }}>
          <ContactFooter color={primary} />
        </div>
      </div>
    );
  }

  // --- TEMPLATE 3: VIBRANT GRADIENT ---
  if (template === TemplateType.VIBRANT_GRADIENT) {
    const primary = customColors?.primary || '#f43f5e';
    const secondary = customColors?.secondary || '#facc15';
    const textCol = getTextColor('#1f2937');
    const cardBg = customColors?.accent || '#ffffff';

    return (
      <div ref={ref} style={{...containerStyle, background: !backgroundImage ? `linear-gradient(to top right, ${primary}, ${secondary})` : undefined }} className="w-[600px] h-[600px] p-8 flex flex-col relative overflow-hidden shadow-2xl">
         {backgroundImage && <div className="absolute inset-0 bg-black/40 z-0"></div>}
         {overlayImage && <RenderOverlay positionClass="top-12 right-12" sizeClass="w-32 h-32" />}
         {!backgroundImage && <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>}
         <div className={`relative z-10 backdrop-blur-sm p-8 rounded-3xl h-full flex flex-col shadow-xl transition-colors`} style={{ backgroundColor: backgroundImage ? 'rgba(0,0,0,0.6)' : `${cardBg}E6`, color: backgroundImage ? '#fff' : textCol }}>
            <div className="flex justify-center mb-6"><LogoComponent color={backgroundImage ? '#fff' : textCol} /></div>
            <div className={`flex-grow flex flex-col justify-center pt-16 ${flexAlignClass}`}>
                <span className="font-bold tracking-widest text-sm uppercase mb-2" style={{ color: backgroundImage ? secondary : primary, fontFamily: bodyFont }}>{service}</span>
                <h1 className="text-4xl font-display font-black mb-4 leading-tight" style={{ ...headlineStyle(backgroundImage ? '#fff' : textCol) }}>{headline}</h1>
                <p className="text-lg mb-8 font-medium" style={bodyStyle(backgroundImage ? '#e5e7eb' : textCol)}>{body}</p>
                <button className="font-bold py-3 px-8 rounded-full shadow-lg transform scale-100" style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, color: '#fff', fontFamily: bodyFont }}>{cta}</button>
            </div>
            <div className="mt-auto border-t pt-4" style={{ borderColor: backgroundImage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}>
               <ContactFooter color={backgroundImage ? '#d1d5db' : textCol} />
            </div>
         </div>
      </div>
    );
  }

  // --- TEMPLATE 4: DARK CORPORATE ---
  if (template === TemplateType.DARK_CORPORATE) {
    const bg = customColors?.background || '#020617';
    const accent = customColors?.accent || '#3b82f6';
    const textCol = getTextColor('#ffffff');

    return (
      <div ref={ref} style={{...containerStyle, backgroundColor: bg}} className="w-[600px] h-[600px] text-white flex flex-col relative overflow-hidden shadow-2xl font-sans">
        <Overlay dark={true} />
        {overlayImage && <RenderOverlay positionClass="bottom-32 right-8" sizeClass="w-56 h-56" style={{ opacity: 0.9 }} />}
        {!backgroundImage && <div className="absolute top-0 right-0 w-[70%] h-full transform -skew-x-12 translate-x-20 border-l" style={{ backgroundColor: bg, filter: 'brightness(1.2)', borderColor: `${accent}30` }}></div>}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        {!backgroundImage && <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: accent }}></div>}
        <div className="relative z-10 h-full flex flex-col p-10">
          <div className="flex justify-between items-center mb-12">
            <LogoComponent color={textCol} />
            <div className="flex items-center gap-2 px-3 py-1 rounded border backdrop-blur" style={{ borderColor: `${accent}50`, backgroundColor: `${bg}80` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }}></div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: textCol, opacity: 0.8, fontFamily: bodyFont }}>{service}</span>
            </div>
          </div>
          <div className={`flex-grow flex flex-col justify-center relative pl-4 max-w-sm ${flexAlignClass}`}>
             <div className="absolute left-0 top-2 bottom-2 w-1" style={{ background: `linear-gradient(to bottom, ${accent}, transparent)` }}></div>
             <h1 className="text-5xl font-display font-bold leading-tight mb-6 tracking-tight" style={headlineStyle(textCol)}>{headline}</h1>
             <p className="text-lg font-light leading-relaxed mb-8" style={{ ...bodyStyle(textCol), opacity: 0.6 }}>{body}</p>
             <div><div className="inline-flex items-center gap-2 bg-white px-6 py-3 font-bold uppercase tracking-wide text-sm" style={{ color: bg, boxShadow: `4px 4px 0px 0px ${accent}`, fontFamily: bodyFont }}>{cta} <ArrowRight size={16} style={{ color: accent }} /></div></div>
          </div>
          <div className="mt-auto border-t pt-6" style={{ borderColor: `${textCol}20` }}>
             <ContactFooter color={textCol} />
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 5: MINIMALIST LIGHT ---
  if (template === TemplateType.MINIMALIST_LIGHT) {
    const bg = customColors?.background || '#ffffff';
    const textCol = getTextColor('#000000');
    const accent = customColors?.accent || '#9ca3af';

    return (
      <div ref={ref} style={{...containerStyle, backgroundColor: bg }} className="w-[600px] h-[600px] p-12 flex flex-col relative shadow-2xl overflow-hidden font-sans">
        <Overlay dark={false} />
        {overlayImage && <RenderOverlay positionClass="top-12 right-12" sizeClass="w-32 h-32" />}
        <div className="relative z-10 h-full flex flex-col border p-8 backdrop-blur-[2px]" style={{ borderColor: `${textCol}20`, backgroundColor: `${bg}80` }}>
           <div className="flex justify-between items-start mb-12">
             <LogoComponent color={textCol} />
             <div className="text-xs font-serif italic" style={{ color: `${textCol}80`, fontFamily: bodyFont }}>Since 2024</div>
           </div>
           <div className={`flex-grow flex flex-col justify-center ${flexAlignClass}`}>
              <div className="w-12 h-1 mb-8" style={{ backgroundColor: textCol }}></div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: accent, fontFamily: bodyFont }}>{service}</h2>
              <h1 className="text-5xl font-serif font-medium leading-tight mb-6" style={headlineStyle(textCol)}>{headline}</h1>
              <p className="text-lg font-light mb-8 max-w-sm" style={{ ...bodyStyle(textCol), opacity: 0.7 }}>{body}</p>
              <div><span className="border-b-2 pb-1 text-sm font-bold uppercase tracking-wider cursor-pointer transition-colors" style={{ borderColor: textCol, color: textCol, fontFamily: bodyFont }}>{cta}</span></div>
           </div>
           <div className="mt-auto pt-8">
             <ContactFooter color={textCol} />
           </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 6: TECH NEON ---
  if (template === TemplateType.TECH_NEON) {
     const bg = customColors?.background || '#000000';
     const primary = customColors?.primary || '#06b6d4';
     const secondary = customColors?.secondary || '#d946ef';
     const textCol = getTextColor('#ffffff');

     return (
       <div ref={ref} style={{...containerStyle, backgroundColor: bg}} className="w-[600px] h-[600px] p-8 flex flex-col relative overflow-hidden font-mono shadow-2xl">
         <Overlay dark={true} />
         {overlayImage && <RenderOverlay positionClass="top-24 right-8" sizeClass="w-40 h-40" />}
         <div className="relative z-10 h-full border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6 flex flex-col backdrop-blur-sm" style={{ borderColor: primary, boxShadow: `0 0 15px ${primary}80`, backgroundColor: `${bg}66` }}>
            <div className="absolute top-0 left-0 w-4 h-4" style={{ backgroundColor: primary }}></div>
            <div className="absolute top-0 right-0 w-4 h-4" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-0 left-0 w-4 h-4" style={{ backgroundColor: primary }}></div>
            <div className="absolute bottom-0 right-0 w-4 h-4" style={{ backgroundColor: primary }}></div>
            <div className="flex justify-between items-center mb-10 border-b pb-4" style={{ borderColor: `${primary}40` }}>
              <LogoComponent color={textCol} />
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: secondary }}></div><span className="text-xs" style={{ color: primary }}>LIVE</span></div>
            </div>
            <div className={`flex-grow max-w-sm flex flex-col ${flexAlignClass}`}>
              <h3 className="font-bold mb-2 tracking-widest text-sm uppercase" style={{ color: secondary, fontFamily: bodyFont }}>&gt;&gt; {service}</h3>
              <h1 className="text-4xl font-bold mb-6 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" style={headlineStyle(textCol)}>{headline}</h1>
              <div className="p-4 border-l-4 mb-8" style={{ backgroundColor: `${primary}15`, borderColor: secondary }}><p className="text-lg leading-relaxed" style={bodyStyle(textCol)}>{body}</p></div>
              <button className="w-full py-4 bg-transparent border font-bold hover:text-black transition-all shadow-[0_0_10px_rgba(0,0,0,0.3)] uppercase tracking-widest" style={{ borderColor: primary, color: primary, fontFamily: bodyFont }}>[ {cta} ]</button>
            </div>
            <div className="mt-8 text-center text-xs">
              <ContactFooter color={primary} />
            </div>
         </div>
       </div>
     );
  }

  // --- TEMPLATE 7: GLASS MORPHISM ---
  if (template === TemplateType.GLASS_MORPHISM) {
    const primary = customColors?.primary || '#7c3aed';
    const secondary = customColors?.secondary || '#2563eb';
    const textCol = getTextColor('#ffffff');
    const fallbackBg = !backgroundImage ? `linear-gradient(to right, ${primary}, ${secondary})` : undefined;

    return (
      <div ref={ref} style={{...containerStyle, background: fallbackBg }} className="w-[600px] h-[600px] text-white p-8 flex flex-col relative overflow-hidden shadow-2xl">
         {!backgroundImage && (<><div className="absolute top-0 left-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ backgroundColor: '#ec4899' }}></div><div className="absolute bottom-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-50" style={{ backgroundColor: '#06b6d4' }}></div></>)}
         {overlayImage && <RenderOverlay positionClass="top-10 right-10" sizeClass="w-48 h-48" />}
         <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-center"><LogoComponent color={textCol} /><Sparkles className="w-6 h-6" style={{ color: `${textCol}80` }} /></div>
            <div className="w-full backdrop-blur-xl border rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] mt-auto mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <div className={`flex flex-col ${flexAlignClass}`}>
                <div className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: `${textCol}B3`, fontFamily: bodyFont }}><div className="w-8 h-px" style={{ backgroundColor: `${textCol}80` }}></div>{service}</div>
                <h1 className="text-4xl font-bold mb-4 leading-tight" style={headlineStyle(textCol)}>{headline}</h1>
                <p className="text-lg mb-6 font-light" style={{ ...bodyStyle(textCol), opacity: 0.8 }}>{body}</p>
                <button className="w-full py-3 font-bold rounded-xl shadow-lg transition-colors" style={{ backgroundColor: textCol, color: primary, fontFamily: bodyFont }}>{cta}</button>
              </div>
            </div>
            <div className="flex justify-center items-center gap-4 text-xs font-medium rounded-full py-2 px-4 backdrop-blur-md mx-auto w-fit" style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: `${textCol}99` }}>
              <ContactFooter color={textCol} />
            </div>
         </div>
      </div>
    )
  }

  // --- TEMPLATE 8: LUXURY GOLD ---
  if (template === TemplateType.LUXURY_GOLD) {
    const bg = customColors?.background || '#000000';
    const gold = customColors?.primary || '#fbbf24';
    const textCol = getTextColor('#ffffff');

    return (
      <div ref={ref} style={{...containerStyle, backgroundColor: bg }} className="w-[600px] h-[600px] p-10 flex flex-col relative overflow-hidden shadow-2xl">
         {backgroundImage && <div className="absolute inset-0 bg-black/80 z-0"></div>}
         {overlayImage && <RenderOverlay positionClass="top-10 right-10" sizeClass="w-36 h-36" />}
         <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(to right, transparent, ${gold}, transparent)` }}></div>
         <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: `linear-gradient(to right, transparent, ${gold}, transparent)` }}></div>
         {!backgroundImage && (
           <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
         )}
         <div className="relative z-10 flex flex-col h-full border p-8" style={{ borderColor: `${gold}33` }}>
            <div className="flex justify-center mb-10"><LogoComponent color={gold} /></div>
            <div className={`flex-grow flex flex-col justify-center ${flexAlignClass}`}>
               <div className="flex items-center justify-center gap-2 mb-4" style={{ color: gold }}>
                 <Star size={12} fill="currentColor" />
                 <span className="uppercase tracking-[0.3em] text-xs font-serif" style={{ fontFamily: bodyFont }}>{service}</span>
                 <Star size={12} fill="currentColor" />
               </div>
               <h1 className="text-4xl font-serif italic mb-6 leading-snug" style={headlineStyle(textCol)}>{headline}</h1>
               <div className="w-16 h-px mx-auto mb-6" style={{ backgroundColor: gold }}></div>
               <p className="font-light text-lg mb-8" style={{ ...bodyStyle(textCol), opacity: 0.8 }}>{body}</p>
               {/* FIX: Removed invalid ':hover' from inline style object. Hover effects should be handled by CSS classes. */}
               <button className="mx-auto border px-8 py-3 uppercase tracking-widest text-xs hover:text-black transition-all duration-300" style={{ borderColor: gold, color: gold, fontFamily: bodyFont }}>{cta}</button>
            </div>
            <ContactFooter color={gold} />
         </div>
      </div>
    );
  }

  // --- TEMPLATE 9: NEO BRUTALISM ---
  if (template === TemplateType.NEO_BRUTALISM) {
    const bg = customColors?.background || '#fffbf0';
    const primary = customColors?.primary || '#4ecdc4';
    const secondary = customColors?.secondary || '#ffe66d';
    const textCol = getTextColor('#000000');

    return (
      <div ref={ref} style={{...containerStyle, backgroundColor: bg }} className="w-[600px] h-[600px] text-black p-6 flex flex-col relative overflow-hidden shadow-2xl font-sans">
         <Overlay dark={false} />
         {overlayImage && <RenderOverlay positionClass="bottom-20 right-8" sizeClass="w-48 h-48" style={{ filter: 'drop-shadow(8px 8px 0px #000)' }} />}
         {!backgroundImage && (<div className="absolute top-0 right-0 w-1/2 h-full border-l-4 border-black z-0" style={{ backgroundColor: customColors?.accent || '#ff6b6b' }}></div>)}
         <div className="relative z-10 h-full flex flex-col">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 mb-8 flex justify-between items-center transform -rotate-1">
              <LogoComponent color="#000" />
              <div className="border-2 border-black px-2 py-0.5 font-bold text-xs uppercase" style={{ backgroundColor: secondary }}>New</div>
            </div>
            <div className={`flex-grow flex flex-col ${flexAlignClass}`}>
               <div className="inline-block border-4 border-black px-4 py-2 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ backgroundColor: primary }}>
                 <span className="font-black uppercase tracking-tighter" style={{ fontFamily: bodyFont }}>{service}</span>
               </div>
               <div className="bg-white border-4 border-black p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-6 max-w-md">
                 <h1 className="text-4xl font-black leading-none mb-4" style={headlineStyle(textCol)}>{headline}</h1>
                 <p className="font-bold text-lg leading-tight" style={bodyStyle(textCol)}>{body}</p>
               </div>
               <button className="text-black border-4 border-black px-8 py-4 font-black text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all" style={{ backgroundColor: secondary, fontFamily: bodyFont }}>{cta} !!!</button>
            </div>
            <div className="bg-black text-white p-4 font-mono font-bold text-sm flex justify-between border-4 border-black mt-auto">
               <ContactFooter color="#fff" />
            </div>
         </div>
      </div>
    );
  }

  // --- TEMPLATE 10: SOFT PASTEL ---
  if (template === TemplateType.SOFT_PASTEL) {
    const primary = customColors?.primary || '#dbeafe';
    const secondary = customColors?.secondary || '#fce7f3';
    const textCol = getTextColor('#475569');
    const accent = customColors?.accent || '#a855f7';

    const defaultBg = !backgroundImage ? `linear-gradient(to bottom, ${primary}, ${secondary})` : "";
    return (
      <div ref={ref} style={{...containerStyle, background: defaultBg }} className="w-[600px] h-[600px] p-12 flex flex-col relative overflow-hidden shadow-2xl">
         {backgroundImage && <div className="absolute inset-0 bg-white/70 z-0 backdrop-blur-sm"></div>}
         {overlayImage && <RenderOverlay positionClass="top-10 right-10" sizeClass="w-40 h-40" style={{ opacity: 0.9 }} />}
         {!backgroundImage && (<><div className="absolute top-[-50px] left-[-50px] w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: `${primary}80` }}></div><div className="absolute bottom-[-50px] right-[-50px] w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: `${secondary}80` }}></div></>)}
         <div className="relative z-10 h-full flex flex-col text-center items-center justify-center">
            <div className="mb-8"><LogoComponent color={textCol} /></div>
            <div className={`bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-xl max-w-md flex flex-col ${flexAlignClass}`}>
               <div className="text-sm font-medium uppercase tracking-widest mb-4 flex items-center justify-center gap-2" style={{ color: accent, fontFamily: bodyFont }}>
                 <Hexagon size={10} fill={accent} /> {service} <Hexagon size={10} fill={accent} />
               </div>
               <h1 className="text-3xl font-display font-bold mb-4 leading-tight" style={headlineStyle(textCol)}>{headline}</h1>
               <p className="mb-8 leading-relaxed" style={bodyStyle(textCol)}>{body}</p>
               <button className="text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all" style={{ backgroundColor: textCol, fontFamily: bodyFont }}>{cta}</button>
            </div>
            <div className="mt-8 flex gap-4 text-xs font-medium" style={{ color: `${textCol}99` }}>
               <ContactFooter color={textCol} />
            </div>
         </div>
      </div>
    );
  }

  // --- TEMPLATE 11: RETRO POP ---
  if (template === TemplateType.RETRO_POP) {
    const bg = customColors?.background || '#fde047';
    const primary = customColors?.primary || '#ec4899';
    const secondary = customColors?.secondary || '#2dd4bf';
    const textCol = getTextColor('#000000');

    return (
      <div ref={ref} style={{...containerStyle, backgroundColor: bg }} className="w-[600px] h-[600px] text-black p-8 flex flex-col relative overflow-hidden shadow-2xl font-sans">
        <Overlay dark={false} />
        {overlayImage && <RenderOverlay positionClass="bottom-8 right-8" sizeClass="w-48 h-48" style={{ filter: 'drop-shadow(4px 4px 0px #000)' }} />}
        {!backgroundImage && (
           <>
             <div className="absolute top-0 right-0 w-0 h-0 border-l-[300px] border-l-transparent border-t-[300px]" style={{ borderTopColor: primary }}></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full border-4 border-black" style={{ backgroundColor: secondary }}></div>
             <div className="absolute top-1/2 left-4 w-4 h-4 bg-black rounded-full"></div>
             <div className="absolute top-1/2 left-8 w-4 h-4 bg-black rounded-full"></div>
             <div className="absolute top-1/2 left-12 w-4 h-4 bg-black rounded-full"></div>
           </>
        )}
        <div className="relative z-10 h-full flex flex-col border-4 border-black bg-white/80 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
             <LogoComponent dark />
             <div className="bg-black text-white px-3 py-1 font-bold text-xs uppercase rotate-3" style={{ fontFamily: bodyFont }}>{service}</div>
           </div>
           <div className={`flex-grow flex flex-col ${flexAlignClass}`}>
              <h1 className="text-5xl font-black mb-4 leading-none tracking-tight" style={headlineStyle(textCol)}>{headline}</h1>
              <div className="text-white p-4 font-bold border-2 border-black transform -rotate-1 mb-6 inline-block" style={{ backgroundColor: primary }}>
                <p style={{ ...bodyStyle('#ffffff'), color: '#ffffff', fontSize: '1.5rem' }}>{body}</p>
              </div>
           </div>
           <div className="flex items-center justify-between mt-auto">
             <button className="text-black border-2 border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" style={{ backgroundColor: secondary, fontFamily: bodyFont }}>{cta}</button>
             <div className="text-xs font-bold text-right">
                <ContactFooter color="#000" />
             </div>
           </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 12: NATURE ORGANIC ---
  if (template === TemplateType.NATURE_ORGANIC) {
    const bg = customColors?.background || '#e8ece6';
    const primary = customColors?.primary || '#3a4d39';
    const secondary = customColors?.secondary || '#4f6f52';
    const textCol = getTextColor(primary);

    return (
      <div ref={ref} style={{...containerStyle, backgroundColor: bg, color: primary }} className="w-[600px] h-[600px] p-10 flex flex-col relative overflow-hidden shadow-2xl font-serif">
        {backgroundImage && <div className="absolute inset-0 bg-white/60 z-0"></div>}
        {overlayImage && <RenderOverlay positionClass="top-8 right-8" sizeClass="w-40 h-40" />}
        {!backgroundImage && (
           <>
            <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: secondary }}></div>
            <div className="absolute -bottom-10 -right-10 w-80 h-80 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: secondary }}></div>
           </>
        )}
        <div className="relative z-10 h-full flex flex-col">
           <div className="text-center mb-10"><LogoComponent color={primary} /></div>
           <div className={`flex-grow flex flex-col items-center ${flexAlignClass}`}>
             <div className="text-xs font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-2" style={{ color: secondary, fontFamily: bodyFont }}>
               <Leaf size={14} /> {service} <Leaf size={14} />
             </div>
             <div className="border-t border-b py-8 mb-6 w-full max-w-sm" style={{ borderColor: `${primary}33` }}>
                <h1 className="text-4xl italic font-medium mb-4" style={headlineStyle(textCol)}>{headline}</h1>
                <p className="text-base" style={bodyStyle(textCol)}>{body}</p>
             </div>
             <button className="px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:opacity-90 transition-colors" style={{ backgroundColor: primary, color: bg, fontFamily: bodyFont }}>
               {cta}
             </button>
           </div>
           <div className="mt-auto flex justify-center gap-6 text-xs uppercase tracking-widest border-t pt-4" style={{ borderColor: `${primary}1A`, color: secondary }}>
             <ContactFooter color={primary} />
           </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 13: BOLD TYPOGRAPHY ---
  if (template === TemplateType.BOLD_TYPOGRAPHY) {
    const bg = customColors?.background || '#dc2626';
    const textCol = getTextColor('#ffffff');
    const accent = customColors?.accent || '#ffffff';

    return (
      <div ref={ref} style={{...containerStyle, backgroundColor: bg }} className="w-[600px] h-[600px] text-white p-8 flex flex-col relative overflow-hidden shadow-2xl font-sans">
        {backgroundImage && <div className="absolute inset-0 bg-black/50 mix-blend-multiply z-0"></div>}
        {overlayImage && <RenderOverlay positionClass="bottom-0 right-0" sizeClass="w-64 h-64" style={{ mixBlendMode: 'luminosity' }} />}
        {!backgroundImage && (
           <div className="absolute top-0 right-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
        )}
        <div className="relative z-10 h-full flex flex-col">
           <div className="flex justify-between items-start border-b-4 pb-6 mb-6" style={{ borderColor: accent }}>
             <LogoComponent color={accent} />
             <div className="text-right">
               <div className="px-2 font-black uppercase text-xl inline-block" style={{ backgroundColor: accent, color: bg, fontFamily: bodyFont }}>{service}</div>
               <div className="text-xs font-mono mt-1 opacity-80" style={{ color: textCol }}>ISSUE #01</div>
             </div>
           </div>
           <div className={`flex-grow flex flex-col ${flexAlignClass}`}>
              <h1 className="text-6xl font-black uppercase leading-[0.85] tracking-tighter mb-6 break-words" style={headlineStyle(textCol)}>{headline}</h1>
              <div className="bg-white text-black p-6 max-w-sm">
                 <p className="font-bold text-lg leading-tight" style={{ ...bodyStyle('#000'), color: '#000' }}>{body}</p>
                 <div className="mt-4 flex items-center gap-2 font-black uppercase cursor-pointer hover:gap-4 transition-all" style={{ color: bg, fontFamily: bodyFont }}>
                   {cta} <ArrowRight size={20} />
                 </div>
              </div>
           </div>
           <div className="mt-8 border-t-4 pt-4 flex justify-between font-mono text-sm font-bold" style={{ borderColor: accent }}>
              <ContactFooter color={textCol} />
           </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 14: MINIMAL DARK ---
  if (template === TemplateType.MINIMAL_DARK) {
    const bg = customColors?.background || '#0f172a';
    const accent = customColors?.accent || '#38bdf8';
    const textCol = getTextColor('#ffffff');
    
    return (
      <div ref={ref} style={{...containerStyle, backgroundColor: bg }} className="w-[600px] h-[600px] p-12 flex flex-col relative overflow-hidden shadow-2xl font-sans">
        <Overlay dark={true} />
        {overlayImage && <RenderOverlay positionClass="top-1/2 -translate-y-1/2 right-0" sizeClass="w-64 h-64" style={{ opacity: 0.8 }} />}
        
        {!backgroundImage && (
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
        )}

        <div className="relative z-10 h-full flex flex-col">
           <div className="flex justify-between items-start mb-12">
             <LogoComponent color={textCol} />
             <div className="w-12 h-1" style={{ backgroundColor: accent }}></div>
           </div>
           
           <div className={`flex-grow flex flex-col justify-center max-w-md ${flexAlignClass}`}>
             <div className="text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2" style={{ color: accent, fontFamily: bodyFont }}>
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }}></div>
               {service}
             </div>
             <h1 className="text-5xl font-bold leading-tight mb-6" style={headlineStyle(textCol)}>{headline}</h1>
             <p className="text-lg font-light leading-relaxed mb-8" style={{ color: textCol, opacity: 0.7, fontFamily: bodyFont }}>{body}</p>
             
             <button className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest group" style={{ color: textCol, fontFamily: bodyFont }}>
               {cta} 
               <span className="p-2 rounded-full transition-transform group-hover:translate-x-1" style={{ backgroundColor: accent, color: bg }}>
                 <ArrowRight size={16} />
               </span>
             </button>
           </div>
           
           <div className="relative z-10 pt-8 border-t" style={{ borderColor: `${textCol}20` }}>
              <div className="flex justify-between text-xs font-mono" style={{ color: textCol, opacity: 0.5, fontFamily: bodyFont }}>
                <ContactFooter color={textCol} />
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 15: ARTISTIC BRUSH ---
  if (template === TemplateType.ARTISTIC_BRUSH) {
    const bg = customColors?.background || '#ffffff';
    const primary = customColors?.primary || '#db2777';
    const secondary = customColors?.secondary || '#4f46e5';
    const textCol = getTextColor('#1f2937');

    return (
      <div ref={ref} style={{...containerStyle, backgroundColor: bg }} className="w-[600px] h-[600px] p-10 flex flex-col relative overflow-hidden shadow-2xl font-sans">
         <Overlay dark={false} />
         {overlayImage && <RenderOverlay positionClass="top-20 right-10" sizeClass="w-48 h-48" />}

         {!backgroundImage && (
           <>
            <div className="absolute top-[-50px] right-[-50px] w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: secondary }}></div>
            <div className="absolute bottom-[-50px] left-[-50px] w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: primary }}></div>
           </>
         )}

         <div className="relative z-10 h-full flex flex-col">
            <div className="text-center mb-8"><LogoComponent color={textCol} /></div>
            
            <div className={`flex-grow flex flex-col justify-center relative ${flexAlignClass}`}>
               {/* Brush Stroke Background for Text */}
               <div className="absolute inset-0 opacity-10 transform -rotate-2 scale-110" 
                    style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}></div>
               
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase mb-4" style={{ backgroundColor: `${primary}20`, color: primary, fontFamily: bodyFont }}>
                   <Brush size={12} /> {service}
                 </div>
                 <h1 className="text-5xl font-black mb-6 leading-none" style={headlineStyle(textCol)}>{headline}</h1>
                 <p className="text-lg font-medium mb-8 max-w-sm mx-auto" style={{ color: textCol, opacity: 0.8, fontFamily: bodyFont }}>{body}</p>
                 <button className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transform transition-transform hover:scale-105" 
                         style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, fontFamily: bodyFont }}>
                   {cta}
                 </button>
               </div>
            </div>

            <div className="mt-auto pt-6 border-t flex justify-center gap-6 font-bold text-xs" style={{ borderColor: `${textCol}20`, color: textCol, opacity: 0.6, fontFamily: bodyFont }}>
               <ContactFooter color={textCol} />
            </div>
         </div>
      </div>
    );
  }

  // --- DEFAULT: CLEAN CORPORATE ---
  const bg = customColors?.background || '#ffffff';
  const textCol = getTextColor('#111827');
  const primary = customColors?.primary || '#2563eb';

  return (
    <div ref={ref} style={{...containerStyle, backgroundColor: bg }} className="w-[600px] h-[600px] p-10 flex flex-col relative shadow-2xl border border-gray-200">
       <Overlay dark={false} />
       {overlayImage && <RenderOverlay positionClass="top-10 right-10" sizeClass="w-48 h-48" />}

       {!backgroundImage && <div className="absolute top-0 right-0 w-40 h-40 rounded-bl-full -mr-10 -mt-10 z-0" style={{ backgroundColor: `${primary}15` }}></div>}
       
       <div className="relative z-10 flex items-center justify-between mb-16">
          <LogoComponent color={textCol} />
       </div>

       <div className={`relative z-10 flex-grow max-w-md flex flex-col ${flexAlignClass}`}>
          <div className="flex items-center gap-2 font-bold mb-4" style={{ color: primary, fontFamily: bodyFont }}>
             <div className="h-1 w-10" style={{ backgroundColor: primary }}></div>
             {service.toUpperCase()}
          </div>
          <h1 className="text-5xl font-sans font-bold leading-tight mb-6" style={headlineStyle(textCol)}>
            {headline}
          </h1>
          <p className="text-xl mb-8 leading-relaxed" style={{ color: textCol, opacity: 0.8, fontFamily: bodyFont }}>
            {body}
          </p>
          <div className="inline-block border-2 px-8 py-3 font-bold transition-colors hover:text-white" 
               style={{ borderColor: primary, color: primary, fontFamily: bodyFont }}
               onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primary; e.currentTarget.style.color = bg; }}
               onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = primary; }}>
            {cta}
          </div>
       </div>

       <div className="relative z-10">
          <ContactFooter color={textCol} />
       </div>
    </div>
  );
});

PostPreview.displayName = 'PostPreview';

import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { 
  SERVICES, 
  CONTACT_DETAILS, 
  TemplateType, 
  PostContent,
  AVAILABLE_FONTS,
  CustomColors
} from './types';
import { 
  generatePostContent, 
  generateBackgroundImage, 
  generateOverlayImage, 
  recommendTemplate,
  generateVisualIdentity
} from './services/geminiService';
import { removeBackground } from './utils/imageUtils';
import { PostPreview } from './components/PostPreview';
import { TemplateThumbnail } from './components/TemplateThumbnail';
import { 
  Download, 
  Sparkles, 
  RefreshCw, 
  Image as ImageIcon, 
  Layout, 
  Type,
  CheckCircle,
  AlertCircle,
  Wand2,
  Trash2,
  Zap,
  Box,
  Sliders,
  Scissors,
  Undo,
  Redo,
  Palette,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

type AppState = {
  service: string;
  template: TemplateType;
  content: PostContent;
  bgImage: string | null;
  overlay: string | null;
  overlayConfig: { scale: number; x: number; y: number };
  logo: string | null;
  customColors: CustomColors | null;
  headlineFont: string;
  bodyFont: string;
  textColor: string;
  logoConfig: { scale: number; x: number; y: number; radius: number; borderWidth: number; borderColor: string };
  textAlign: 'left' | 'center' | 'right';
};

const App = () => {
  const [selectedService, setSelectedService] = useState<string>(SERVICES[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(TemplateType.MODERN_BLUE);
  const [customTopic, setCustomTopic] = useState<string>('');
  
  const [bgPrompt, setBgPrompt] = useState<string>('');
  const [overlayPrompt, setOverlayPrompt] = useState<string>('');
  const [colorPrompt, setColorPrompt] = useState<string>('');
  
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [customColors, setCustomColors] = useState<CustomColors | null>(null);
  
  // Typography State
  const [headlineFont, setHeadlineFont] = useState<string>('');
  const [bodyFont, setBodyFont] = useState<string>('');
  const [customTextColor, setCustomTextColor] = useState<string>('');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // Overlay Adjustments
  const [overlayScale, setOverlayScale] = useState<number>(1);
  const [overlayX, setOverlayX] = useState<number>(0);
  const [overlayY, setOverlayY] = useState<number>(0);

  // Logo Adjustments
  const [logoScale, setLogoScale] = useState<number>(1);
  const [logoX, setLogoX] = useState<number>(0);
  const [logoY, setLogoY] = useState<number>(0);
  const [logoRadius, setLogoRadius] = useState<number>(0);
  const [logoBorderWidth, setLogoBorderWidth] = useState<number>(0);
  const [logoBorderColor, setLogoBorderColor] = useState<string>('#000000');
  
  // Preview Zoom State
  const [zoomLevel, setZoomLevel] = useState<number>(0.8);

  // History State
  const [history, setHistory] = useState<AppState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBgLoading, setIsBgLoading] = useState<boolean>(false);
  const [isOverlayLoading, setIsOverlayLoading] = useState<boolean>(false);
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState<boolean>(false);
  const [isRecommendingTemplate, setIsRecommendingTemplate] = useState<boolean>(false);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [bgError, setBgError] = useState<string | null>(null);
  const [overlayError, setOverlayError] = useState<string | null>(null);
  const [themeError, setThemeError] = useState<string | null>(null);
  
  const [content, setContent] = useState<PostContent>({
    headline: "AI Calling Agent",
    body: "Revolutionize your customer support with our intelligent AI voice assistants.",
    cta: "Get Started"
  });

  const previewRef = useRef<HTMLDivElement>(null);

  // Helper to record state changes
  const recordChange = (partialState: Partial<AppState>) => {
    const currentState: AppState = {
        service: selectedService,
        template: selectedTemplate,
        content: content,
        bgImage: backgroundImage,
        overlay: overlayImage,
        overlayConfig: { scale: overlayScale, x: overlayX, y: overlayY },
        logo: logoUrl,
        customColors: customColors,
        headlineFont: headlineFont,
        bodyFont: bodyFont,
        textColor: customTextColor,
        logoConfig: { 
          scale: logoScale, x: logoX, y: logoY, radius: logoRadius,
          borderWidth: logoBorderWidth, borderColor: logoBorderColor
        },
        textAlign: textAlign
    };
    
    const newState = { ...currentState, ...partialState };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    // Limit history size to 50
    if (newHistory.length > 50) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevState = history[prevIndex];
      applyState(prevState);
      setHistoryIndex(prevIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      applyState(nextState);
      setHistoryIndex(nextIndex);
    }
  };

  const applyState = (state: AppState) => {
    setSelectedService(state.service);
    setSelectedTemplate(state.template);
    setContent(state.content);
    setBackgroundImage(state.bgImage);
    setOverlayImage(state.overlay);
    setOverlayScale(state.overlayConfig.scale);
    setOverlayX(state.overlayConfig.x);
    setOverlayY(state.overlayConfig.y);
    setLogoUrl(state.logo);
    setCustomColors(state.customColors);
    setHeadlineFont(state.headlineFont);
    setBodyFont(state.bodyFont);
    setCustomTextColor(state.textColor);
    setLogoScale(state.logoConfig.scale);
    setLogoX(state.logoConfig.x);
    setLogoY(state.logoConfig.y);
    setLogoRadius(state.logoConfig.radius);
    setLogoBorderWidth(state.logoConfig.borderWidth);
    setLogoBorderColor(state.logoConfig.borderColor);
    setTextAlign(state.textAlign);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newContent = await generatePostContent(selectedService, customTopic);
      setContent(newContent);
      recordChange({ content: newContent });
    } catch (err) {
      setError("Failed to generate content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBackground = async () => {
    setIsBgLoading(true);
    setBgError(null);
    try {
      const prompt = bgPrompt || `${selectedService} technology abstract modern`;
      const bgImage = await generateBackgroundImage(prompt, selectedTemplate);
      setBackgroundImage(bgImage);
      recordChange({ bgImage });
    } catch (err) {
      setBgError("Failed to generate image.");
    } finally {
      setIsBgLoading(false);
    }
  };

  const handleGenerateOverlay = async () => {
    setIsOverlayLoading(true);
    setOverlayError(null);
    try {
      const prompt = overlayPrompt || `${selectedService} 3d icon illustration`;
      const img = await generateOverlayImage(prompt);
      setOverlayImage(img);
      const resetConfig = { scale: 1, x: 0, y: 0 };
      setOverlayScale(resetConfig.scale);
      setOverlayX(resetConfig.x);
      setOverlayY(resetConfig.y);
      recordChange({ overlay: img, overlayConfig: resetConfig });
    } catch (err) {
      setOverlayError("Failed to generate element.");
    } finally {
      setIsOverlayLoading(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!overlayImage) return;
    setIsRemovingBg(true);
    setOverlayError(null);
    try {
      const newImage = await removeBackground(overlayImage, 40); // Tolerance 40
      setOverlayImage(newImage);
      recordChange({ overlay: newImage });
    } catch (err) {
      console.error(err);
      setOverlayError("Failed to remove background.");
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleAutoRecommendTemplate = async () => {
    setIsRecommendingTemplate(true);
    try {
      const template = await recommendTemplate(selectedService, customTopic);
      setSelectedTemplate(template);
      recordChange({ template });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecommendingTemplate(false);
    }
  };

  const handleGenerateTheme = async () => {
    if (!colorPrompt) return;
    setIsGeneratingTheme(true);
    setThemeError(null);
    try {
      const result = await generateVisualIdentity(colorPrompt);
      if (result) {
        setSelectedTemplate(result.template);
        setCustomColors(result.colors);
        // Reset manual text color to use the theme's text color logic
        setCustomTextColor(''); 
        recordChange({ template: result.template, customColors: result.colors, textColor: '' });
      }
    } catch (err) {
      console.error(err);
      setThemeError("Failed to generate theme.");
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  // Utility to get random item
  const getRandomItem = <T,>(arr: T[] | readonly T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const handleAutoGenerate = async () => {
    setIsAutoGenerating(true);
    setError(null);
    setBgError(null);
    setOverlayError(null);
    
    // 1. Randomize All Attributes
    const newService = getRandomItem(SERVICES);
    const newTemplate = getRandomItem(Object.values(TemplateType));
    
    // Fonts (exclude default empty string)
    const validFonts = AVAILABLE_FONTS.filter(f => f.value !== '').map(f => f.value);
    const newHeadlineFont = getRandomItem(validFonts);
    const newBodyFont = getRandomItem(validFonts);
    
    const alignments: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
    const newTextAlign = getRandomItem(alignments);
    
    // Update UI State Immediately
    setSelectedService(newService);
    setSelectedTemplate(newTemplate);
    setHeadlineFont(newHeadlineFont);
    setBodyFont(newBodyFont);
    setTextAlign(newTextAlign);
    setCustomColors(null); // Reset theme to default for variety
    setCustomTextColor('');
    
    // Clear visuals optimistically
    setBackgroundImage(null);
    setOverlayImage(null);
    
    try {
      // 2. Trigger Parallel AI Generation
      const textPromise = generatePostContent(newService, customTopic);
      
      const bgQuery = `${newService} professional high quality`;
      const bgPromise = generateBackgroundImage(bgQuery, newTemplate);

      const overlayQuery = `${newService} 3d icon object`;
      const overlayPromise = generateOverlayImage(overlayQuery);

      const [newContent, newBg, newOverlay] = await Promise.all([
        textPromise, 
        bgPromise.catch(e => { console.error(e); return null; }),
        overlayPromise.catch(e => { console.error(e); return null; })
      ]);

      setContent(newContent);
      if (newBg) setBackgroundImage(newBg);
      if (newOverlay) setOverlayImage(newOverlay);

      // Reset overlay position
      const resetConfig = { scale: 1, x: 0, y: 0 };
      setOverlayScale(1); setOverlayX(0); setOverlayY(0);

      recordChange({ 
          service: newService,
          template: newTemplate,
          content: newContent, 
          bgImage: newBg || null, 
          overlay: newOverlay || null, 
          overlayConfig: resetConfig,
          customColors: null,
          headlineFont: newHeadlineFont,
          bodyFont: newBodyFont,
          textColor: '',
          textAlign: newTextAlign
      });

    } catch (err) {
      setError("Auto-generation failed. Please try individual steps.");
      console.error(err);
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (previewRef.current) {
      try {
        const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 1 });
        const link = document.createElement('a');
        link.download = `alfox-post-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Error downloading image:", err);
        setError("Could not download image.");
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        // Reset logo config on new upload
        const resetLogoConfig = { scale: 1, x: 0, y: 0, radius: 0, borderWidth: 0, borderColor: '#000000' };
        setLogoScale(1);
        setLogoX(0);
        setLogoY(0);
        setLogoRadius(0);
        setLogoBorderWidth(0);
        setLogoBorderColor('#000000');
        recordChange({ logo: result, logoConfig: resetLogoConfig });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoConfigCommit = () => {
      recordChange({ logoConfig: { scale: logoScale, x: logoX, y: logoY, radius: logoRadius, borderWidth: logoBorderWidth, borderColor: logoBorderColor } });
  };

  const handleOverlayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setOverlayImage(result);
        const resetConfig = { scale: 1, x: 0, y: 0 };
        setOverlayScale(1);
        setOverlayX(0);
        setOverlayY(0);
        recordChange({ overlay: result, overlayConfig: resetConfig });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOverlayMove = (x: number, y: number) => {
    setOverlayX(Math.round(x));
    setOverlayY(Math.round(y));
  };

  const handleOverlayDragEnd = () => {
      recordChange({ overlayConfig: { scale: overlayScale, x: overlayX, y: overlayY } });
  };

  const handleLogoMove = (x: number, y: number) => {
    setLogoX(Math.round(x));
    setLogoY(Math.round(y));
  };

  const handleLogoDragEnd = () => {
      handleLogoConfigCommit();
  };

  const handleManualScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setOverlayScale(parseFloat(e.target.value));
  };

  const handleManualScaleCommit = () => {
      recordChange({ overlayConfig: { scale: overlayScale, x: overlayX, y: overlayY } });
  };

  const handleTemplateChange = (t: TemplateType) => {
      setSelectedTemplate(t);
      recordChange({ template: t });
  };

  const handleHeadlineFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const f = e.target.value;
      setHeadlineFont(f);
      recordChange({ headlineFont: f });
  };

  const handleBodyFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const f = e.target.value;
      setBodyFont(f);
      recordChange({ bodyFont: f });
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const c = e.target.value;
      setCustomTextColor(c);
      recordChange({ textColor: c });
  };

  const handleTextAlignChange = (align: 'left' | 'center' | 'right') => {
      setTextAlign(align);
      recordChange({ textAlign: align });
  };

  const handleZoomIn = () => {
      setZoomLevel(prev => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
      setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  // Generate initial content on mount and init history
  useEffect(() => {
    const init = async () => {
        setIsLoading(true);
        try {
            const initialContent = await generatePostContent(selectedService, customTopic);
            setContent(initialContent);
            
            // Initialize History
            const initialState: AppState = {
                service: selectedService,
                template: TemplateType.MODERN_BLUE,
                content: initialContent,
                bgImage: null,
                overlay: null,
                overlayConfig: { scale: 1, x: 0, y: 0 },
                logo: null,
                customColors: null,
                headlineFont: '',
                bodyFont: '',
                textColor: '',
                logoConfig: { scale: 1, x: 0, y: 0, radius: 0, borderWidth: 0, borderColor: '#000000' },
                textAlign: 'left'
            };
            setHistory([initialState]);
            setHistoryIndex(0);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const BASE_SIZE = 600;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1 rounded font-bold">AX</div>
            <h1 className="text-xl font-bold tracking-tight">Alfox.ai <span className="text-gray-400 font-normal">Generator</span></h1>
          </div>
          <div className="flex items-center gap-4">
             {/* Undo / Redo Controls */}
             <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mr-4">
                 <button 
                    onClick={undo} 
                    disabled={historyIndex <= 0}
                    className="p-2 rounded hover:bg-white hover:shadow text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                    title="Undo"
                 >
                    <Undo size={18} />
                 </button>
                 <div className="w-px h-4 bg-gray-300 mx-1"></div>
                 <button 
                    onClick={redo} 
                    disabled={historyIndex >= history.length - 1}
                    className="p-2 rounded hover:bg-white hover:shadow text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                    title="Redo"
                 >
                    <Redo size={18} />
                 </button>
             </div>

             <a href="https://www.alfoxai.com" target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-black">Visit Website</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Service Selection */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
               {/* Magic Auto Generate Button */}
               <div className="mb-6">
                  <button 
                    onClick={handleAutoGenerate}
                    disabled={isAutoGenerating}
                    className="w-full relative overflow-hidden group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
                    <span className="relative flex items-center justify-center gap-2 text-lg">
                       {isAutoGenerating ? <RefreshCw className="animate-spin" /> : <Zap className="fill-white" />}
                       {isAutoGenerating ? 'Creating Magic...' : 'Magic Auto-Generate'}
                    </span>
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2">Generates Random Service + Template + Content + Visuals</p>
               </div>

              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Layout size={16} /> Service
              </h2>
              <select 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                {SERVICES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              
              <div className="mt-4">
                <label className="text-xs text-gray-500 font-medium mb-1 block">Custom Context (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 'Holiday Sale' or 'New Feature'"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded text-sm text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* 2. Content Generation */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles size={16} /> AI Content
              </h2>
              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {isLoading ? 'Generating...' : 'Refresh Text Only'}
              </button>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="mt-6 space-y-4">
                 <div>
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Headline</label>
                    <textarea 
                      value={content.headline} 
                      onChange={(e) => setContent({...content, headline: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded text-sm font-bold resize-none text-gray-900 bg-white"
                      rows={2}
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Body</label>
                    <textarea 
                      value={content.body} 
                      onChange={(e) => setContent({...content, body: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded text-sm resize-none text-gray-900 bg-white"
                      rows={3}
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-1">CTA</label>
                    <input 
                      value={content.cta} 
                      onChange={(e) => setContent({...content, cta: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded text-sm text-gray-900 bg-white"
                    />
                 </div>
              </div>
            </div>

            {/* 3. AI Visuals */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Wand2 size={16} /> AI Visuals
              </h2>
              
              {/* Background Generator */}
              <div className="space-y-3 mb-6">
                <label className="text-xs text-gray-500 font-bold block">Background</label>
                <input 
                  type="text" 
                  placeholder={`Abstract background for ${selectedService}`}
                  value={bgPrompt}
                  onChange={(e) => setBgPrompt(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded text-sm text-gray-900 bg-white"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleGenerateBackground}
                    disabled={isBgLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isBgLoading ? <RefreshCw className="animate-spin" size={14} /> : <Wand2 size={14} />}
                    {isBgLoading ? 'Generating...' : 'Generate BG'}
                  </button>
                  {backgroundImage && (
                    <button 
                      onClick={() => {
                          setBackgroundImage(null);
                          recordChange({ bgImage: null });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded border border-red-200"
                      title="Remove Background"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                {bgError && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{bgError}</div>}
              </div>

              <div className="border-t border-gray-100 my-4"></div>

              {/* Overlay Generator */}
              <div className="space-y-3">
                 <label className="text-xs text-gray-500 font-bold block flex justify-between">
                   <span>Element / Object</span>
                   {overlayImage && <span className="text-green-600 flex items-center gap-1"><CheckCircle size={10} /> Active</span>}
                 </label>
                 
                 <div className="flex gap-2 mb-2">
                     <label className="flex-1 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-2 text-center text-xs font-medium text-gray-600 transition-colors">
                        <input type="file" accept="image/*" onChange={handleOverlayUpload} className="hidden" />
                        <span className="flex items-center justify-center gap-1"><ImageIcon size={12}/> Upload</span>
                     </label>
                 </div>

                 <input 
                  type="text" 
                  placeholder={`3D Icon for ${selectedService}`}
                  value={overlayPrompt}
                  onChange={(e) => setOverlayPrompt(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded text-sm text-gray-900 bg-white"
                />
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleGenerateOverlay}
                    disabled={isOverlayLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isOverlayLoading ? <RefreshCw className="animate-spin" size={14} /> : <Box size={14} />}
                    {isOverlayLoading ? 'Creating...' : 'Generate Element'}
                  </button>
                  {overlayImage && (
                    <button 
                      onClick={() => {
                          setOverlayImage(null);
                          recordChange({ overlay: null });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded border border-red-200"
                      title="Remove Element"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                {overlayError && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{overlayError}</div>}

                {/* Edit Controls */}
                {overlayImage && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Sliders size={12}/> Edit Element</span>
                          <button 
                              onClick={() => { 
                                  const resetConfig = { scale: 1, x: 0, y: 0 };
                                  setOverlayScale(1); setOverlayX(0); setOverlayY(0); 
                                  recordChange({ overlayConfig: resetConfig });
                              }}
                              className="text-[10px] text-blue-500 hover:text-blue-600 font-medium"
                          >
                              Reset
                          </button>
                      </div>

                       {/* Remove Background Button */}
                      <button 
                        onClick={handleRemoveBackground}
                        disabled={isRemovingBg}
                        className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-2 rounded transition-colors disabled:opacity-50 mb-2"
                      >
                         {isRemovingBg ? <RefreshCw className="animate-spin" size={12} /> : <Scissors size={12} />}
                         Remove Background (Beta)
                      </button>
                      
                      {/* Scale */}
                      <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-400 w-8">Size</span>
                          <input 
                              type="range" min="0.1" max="5.0" step="0.1"
                              value={overlayScale}
                              onChange={handleManualScaleChange}
                              onMouseUp={handleManualScaleCommit}
                              onTouchEnd={handleManualScaleCommit}
                              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>

                      {/* X Position */}
                      <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-400 w-8">Pos X</span>
                          <input 
                              type="range" min="-250" max="250" step="5"
                              value={overlayX}
                              onChange={(e) => setOverlayX(parseInt(e.target.value))}
                              onMouseUp={handleManualScaleCommit}
                              onTouchEnd={handleManualScaleCommit}
                              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>

                      {/* Y Position */}
                      <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-400 w-8">Pos Y</span>
                          <input 
                              type="range" min="-250" max="250" step="5"
                              value={overlayY}
                              onChange={(e) => setOverlayY(parseInt(e.target.value))}
                              onMouseUp={handleManualScaleCommit}
                              onTouchEnd={handleManualScaleCommit}
                              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>
                      
                      <p className="text-[10px] text-gray-400 text-center italic mt-2">
                        💡 Tip: You can drag the element directly in the preview
                      </p>
                  </div>
                )}
              </div>

            </div>

            {/* 4. Visual Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Type size={16} /> Appearance
              </h2>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Template Style</label>
                  <button 
                    onClick={handleAutoRecommendTemplate}
                    disabled={isRecommendingTemplate}
                    className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded font-bold flex items-center gap-1 transition-colors"
                    title="Let AI pick the best template based on your service"
                  >
                    {isRecommendingTemplate ? <RefreshCw className="animate-spin" size={10} /> : <Sparkles size={10} />}
                    AI Pick
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1 mb-4">
                  {Object.values(TemplateType).map((t) => (
                    <TemplateThumbnail 
                      key={t}
                      template={t}
                      selected={selectedTemplate === t}
                      onClick={() => handleTemplateChange(t)}
                      customColors={customColors}
                    />
                  ))}
                </div>

                {/* Typography & Text Color Section */}
                <div className="border-t border-gray-100 my-4"></div>
                <label className="text-xs text-gray-500 font-bold block mb-2 flex items-center gap-1">
                  Typography & Text Color
                </label>
                <div className="space-y-2 mb-3">
                   <div className="flex gap-2">
                      <select 
                          value={headlineFont}
                          onChange={handleHeadlineFontChange}
                          className="flex-1 p-2 border border-gray-200 rounded text-sm bg-white text-gray-900"
                          aria-label="Headline Font"
                      >
                          <option value="">Default Headline</option>
                          {AVAILABLE_FONTS.filter(f=>f.value).map(f => (
                            <option key={f.name} value={f.value}>{f.name}</option>
                          ))}
                      </select>
                   </div>
                   <div className="flex gap-2 items-center">
                      <select 
                          value={bodyFont}
                          onChange={handleBodyFontChange}
                          className="flex-1 p-2 border border-gray-200 rounded text-sm bg-white text-gray-900"
                          aria-label="Body Font"
                      >
                          <option value="">Default Body</option>
                          {AVAILABLE_FONTS.filter(f=>f.value).map(f => (
                            <option key={f.name} value={f.value}>{f.name}</option>
                          ))}
                      </select>
                      <div className="relative w-10 h-10 border border-gray-200 rounded overflow-hidden shrink-0">
                          <input 
                            type="color" 
                            value={customTextColor || '#000000'}
                            onChange={handleTextColorChange}
                            className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer"
                            title="Text Color"
                          />
                      </div>
                   </div>
                   {/* Text Alignment Controls */}
                   <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                      <button 
                        onClick={() => handleTextAlignChange('left')}
                        className={`p-1.5 rounded ${textAlign === 'left' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Align Left"
                      >
                        <AlignLeft size={14} />
                      </button>
                      <button 
                        onClick={() => handleTextAlignChange('center')}
                        className={`p-1.5 rounded ${textAlign === 'center' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Align Center"
                      >
                        <AlignCenter size={14} />
                      </button>
                      <button 
                        onClick={() => handleTextAlignChange('right')}
                        className={`p-1.5 rounded ${textAlign === 'right' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Align Right"
                      >
                        <AlignRight size={14} />
                      </button>
                   </div>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                <label className="text-xs text-gray-500 font-bold block mb-2 flex items-center gap-1">
                  <Palette size={12}/> AI Color Theme
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. 'Ocean blue and gold', '#ff0000'"
                    value={colorPrompt}
                    onChange={(e) => setColorPrompt(e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded text-sm text-gray-900 bg-white"
                  />
                  <button 
                    onClick={handleGenerateTheme}
                    disabled={isGeneratingTheme || !colorPrompt}
                    className="bg-gray-800 text-white px-3 rounded hover:bg-black disabled:opacity-50 text-xs font-bold whitespace-nowrap"
                  >
                    {isGeneratingTheme ? <RefreshCw className="animate-spin" size={14} /> : 'Apply'}
                  </button>
                </div>
                {themeError && <div className="text-red-500 text-xs mt-1">{themeError}</div>}
                {customColors && (
                  <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: customColors.primary }} title="Primary"></div>
                      <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: customColors.secondary }} title="Secondary"></div>
                      <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: customColors.accent }} title="Accent"></div>
                      <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: customColors.background }} title="Background"></div>
                    </div>
                    <button onClick={() => { setCustomColors(null); recordChange({ customColors: null }); }} className="text-xs text-red-400 hover:text-red-600">Reset</button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                  <span>Logo</span>
                  {logoUrl && <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle size={10} /> Uploaded</span>}
                </label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden" 
                    id="logo-upload"
                  />
                  <label 
                    htmlFor="logo-upload"
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <ImageIcon size={20} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Click to upload logo</span>
                    </div>
                  </label>
                </div>

                {/* Logo Settings UI */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Move size={12}/> Logo Settings</span>
                        <button 
                            onClick={() => { 
                                const resetConfig = { scale: 1, x: 0, y: 0, radius: 0, borderWidth: 0, borderColor: '#000000' };
                                setLogoScale(1); setLogoX(0); setLogoY(0); setLogoRadius(0); setLogoBorderWidth(0); setLogoBorderColor('#000000');
                                recordChange({ logoConfig: resetConfig });
                            }}
                            className="text-[10px] text-blue-500 hover:text-blue-600 font-medium"
                        >
                            Reset
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400 w-8">Size</span>
                        <input 
                            type="range" min="0.5" max="3" step="0.1"
                            value={logoScale}
                            onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                            onMouseUp={handleLogoConfigCommit}
                            onTouchEnd={handleLogoConfigCommit}
                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400 w-8">Pos X</span>
                        <input 
                            type="range" min="-300" max="300" step="5"
                            value={logoX}
                            onChange={(e) => setLogoX(parseInt(e.target.value))}
                            onMouseUp={handleLogoConfigCommit}
                            onTouchEnd={handleLogoConfigCommit}
                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400 w-8">Pos Y</span>
                        <input 
                            type="range" min="-300" max="300" step="5"
                            value={logoY}
                            onChange={(e) => setLogoY(parseInt(e.target.value))}
                            onMouseUp={handleLogoConfigCommit}
                            onTouchEnd={handleLogoConfigCommit}
                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400 w-8">Radius</span>
                        <input 
                            type="range" min="0" max="50" step="1"
                            value={logoRadius}
                            onChange={(e) => setLogoRadius(parseInt(e.target.value))}
                            onMouseUp={handleLogoConfigCommit}
                            onTouchEnd={handleLogoConfigCommit}
                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400 w-8">Border</span>
                        <input 
                            type="range" min="0" max="20" step="1"
                            value={logoBorderWidth}
                            onChange={(e) => setLogoBorderWidth(parseInt(e.target.value))}
                            onMouseUp={handleLogoConfigCommit}
                            onTouchEnd={handleLogoConfigCommit}
                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="relative w-4 h-4 border border-gray-300 rounded overflow-hidden shrink-0 ml-1">
                          <input 
                            type="color" 
                            value={logoBorderColor || '#000000'}
                            onChange={(e) => {
                                setLogoBorderColor(e.target.value);
                            }}
                            onBlur={handleLogoConfigCommit}
                            className="absolute -top-1 -left-1 w-6 h-6 cursor-pointer p-0 border-0"
                            title="Border Color"
                          />
                       </div>
                    </div>
                    
                    <p className="text-[10px] text-gray-400 text-center italic mt-2">
                        💡 Tip: You can drag the logo directly in the preview
                    </p>
                </div>
              </div>
            </div>

          </div>

          {/* Preview Area */}
          <div className="lg:col-span-8 flex justify-center">
            <div className="sticky top-24 w-full flex flex-col items-center">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center w-full max-w-[800px]">
                <div className="w-full flex justify-between items-center mb-6">
                   <div className="flex items-center gap-3">
                     <h2 className="text-lg font-bold text-gray-800">Live Preview</h2>
                     <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button 
                          onClick={handleZoomOut}
                          className="p-1.5 hover:bg-white hover:shadow rounded-md text-gray-600 transition-all"
                          title="Zoom Out"
                        >
                          <ZoomOut size={14} />
                        </button>
                        <span className="text-xs font-mono px-2 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                        <button 
                          onClick={handleZoomIn}
                          className="p-1.5 hover:bg-white hover:shadow rounded-md text-gray-600 transition-all"
                          title="Zoom In"
                        >
                          <ZoomIn size={14} />
                        </button>
                     </div>
                   </div>
                   <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-medium transition-colors"
                   >
                     <Download size={18} /> Download PNG
                   </button>
                </div>

                {/* The Canvas Container */}
                <div 
                  className="border border-gray-200 shadow-2xl overflow-hidden rounded-md relative flex justify-center items-center bg-gray-100 mx-auto select-none transition-all duration-200" 
                  style={{ 
                    width: `${BASE_SIZE * zoomLevel}px`, 
                    height: `${BASE_SIZE * zoomLevel}px` 
                  }}
                >
                   <div 
                     className="origin-top-left"
                     style={{ 
                       transform: `scale(${zoomLevel})`, 
                       width: `${BASE_SIZE}px`, 
                       height: `${BASE_SIZE}px` 
                     }}
                   >
                      <PostPreview 
                        ref={previewRef}
                        template={selectedTemplate}
                        service={selectedService}
                        headline={content.headline}
                        body={content.body}
                        cta={content.cta}
                        contact={CONTACT_DETAILS}
                        logoUrl={logoUrl}
                        backgroundImage={backgroundImage}
                        overlayImage={overlayImage}
                        overlayScale={overlayScale}
                        overlayX={overlayX}
                        overlayY={overlayY}
                        onOverlayMove={handleOverlayMove}
                        onOverlayDragEnd={handleOverlayDragEnd}
                        customColors={customColors}
                        headlineFont={headlineFont}
                        bodyFont={bodyFont}
                        textColor={customTextColor}
                        logoScale={logoScale}
                        logoX={logoX}
                        logoY={logoY}
                        logoRadius={logoRadius}
                        onLogoMove={handleLogoMove}
                        onLogoDragEnd={handleLogoDragEnd}
                        logoBorderWidth={logoBorderWidth}
                        logoBorderColor={logoBorderColor}
                        textAlign={textAlign}
                      />
                   </div>
                </div>
                
                <p className="mt-4 text-xs text-gray-400 text-center max-w-lg">
                  * Download size: {BASE_SIZE}x{BASE_SIZE}px. <br/>
                  developed for Alfox.ai, developed by lucky(lakshmanna)
                </p>
              </div>
            </div>
          </div>
        
        </div>
      </main>
    </div>
  );
};

export default App;

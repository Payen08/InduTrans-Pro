import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import ResultsTable from './components/ResultsTable';
import SettingsModal from './components/SettingsModal';
import LanguageSelector from './components/LanguageSelector';
import { TranslationResult, AppStatus, TranslationProvider, TencentConfig } from './types';
import { DEFAULT_LANGUAGES, PRESET_TENCENT_CONFIG } from './constants';
import { translateBatch } from './services/geminiService';
import { translateBatchTencent } from './services/tencentService';

const App: React.FC = () => {
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [provider, setProvider] = useState<TranslationProvider>('GEMINI');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(DEFAULT_LANGUAGES);
  
  // Settings & Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLangSelectorOpen, setIsLangSelectorOpen] = useState(false);
  const [tencentConfig, setTencentConfig] = useState<TencentConfig | null>(null);

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('tencent_config');
    if (saved) {
      try {
        setTencentConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    } else if (PRESET_TENCENT_CONFIG.secretId && PRESET_TENCENT_CONFIG.secretKey) {
      // Auto-load preset if local storage is empty and preset exists in code
      console.log("Loading preset Tencent credentials from code.");
      setTencentConfig(PRESET_TENCENT_CONFIG);
    }
  }, []);

  const handleSaveSettings = (config: TencentConfig) => {
    setTencentConfig(config);
    localStorage.setItem('tencent_config', JSON.stringify(config));
    alert("设置已保存！");
  };

  const handleTranslate = async (texts: string[]) => {
    setStatus(AppStatus.TRANSLATING);
    setErrorMsg(null);
    setResults([]);

    try {
      let newResults: TranslationResult[] = [];

      if (provider === 'TENCENT') {
        if (!tencentConfig || !tencentConfig.secretId || !tencentConfig.secretKey) {
          throw new Error("缺少腾讯云凭证，请在设置中配置 SecretId 和 SecretKey。");
        }
        newResults = await translateBatchTencent(texts, selectedLanguages, tencentConfig);
      } else {
        // Default to Gemini
        newResults = await translateBatch(texts, selectedLanguages);
      }

      setResults(newResults);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setStatus(AppStatus.ERROR);
      setErrorMsg(err.message || "翻译失败，请检查网络或 API 限制。");
      console.error(err);
    } finally {
      if (status !== AppStatus.ERROR) {
          setStatus(AppStatus.IDLE);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-[calc(100vh-1px)] overflow-hidden">
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onOpenLanguages={() => setIsLangSelectorOpen(true)}
      />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-h-0 h-[calc(100vh-180px)]">
        
        {/* Intro / Instructions */}
        <div className="mb-4 flex-none">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">工业翻译器 Pro</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            批量翻译工业技术术语。支持 Excel 混合内容粘贴，自动识别段落与列表。
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm flex-none">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="truncate">{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow min-h-0">
          {/* Left Panel: Input */}
          <div className="lg:col-span-4 h-full min-h-0">
            <InputArea 
              onTranslate={handleTranslate} 
              isTranslating={status === AppStatus.TRANSLATING} 
              provider={provider}
              onProviderChange={setProvider}
              onOpenSettings={() => setIsSettingsOpen(true)}
              selectedLanguages={selectedLanguages}
              onLanguagesChange={setSelectedLanguages}
              onOpenLanguages={() => setIsLangSelectorOpen(true)}
            />
          </div>

          {/* Right Panel: Output */}
          <div className="lg:col-span-8 h-full min-h-0">
            <ResultsTable results={results} selectedLanguages={selectedLanguages} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto flex-none">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} InduTrans Pro. 专为工业效率设计。
        </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleSaveSettings}
        currentConfig={tencentConfig}
      />

      <LanguageSelector 
        isOpen={isLangSelectorOpen}
        onClose={() => setIsLangSelectorOpen(false)}
        selectedLanguages={selectedLanguages}
        onChange={setSelectedLanguages}
      />
    </div>
  );
};

export default App;
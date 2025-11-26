import React, { useState, useCallback } from 'react';
import { ArrowRight, Trash2, FileText, Cpu, Cloud, Layers, List, AlignLeft, Languages } from 'lucide-react';
import { TranslationProvider } from '../types';

interface InputAreaProps {
  onTranslate: (text: string[]) => void;
  isTranslating: boolean;
  provider: TranslationProvider;
  onProviderChange: (p: TranslationProvider) => void;
  onOpenSettings: () => void;
  selectedLanguages: string[];
  onLanguagesChange: (langs: string[]) => void;
  onOpenLanguages: () => void;
}

const SEPARATOR_TOKEN = "\n\n__________\n\n";
const SEPARATOR_DISPLAY = "__________";

type SplitMode = 'AUTO' | 'LINE' | 'PARAGRAPH';

// Robust parser for Mixed content (handling Excel/CSV style quotes)
const parseMixedInput = (text: string): string[] => {
  const results: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      // Handle escaped quotes in CSV ("" -> ")
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next char
      } else {
        // Toggle state; boundary quotes are effectively stripped from 'current'
        inQuotes = !inQuotes;
      }
    } else if (char === '\n' && !inQuotes) {
      // If we hit a newline NOT inside quotes, it's a separator
      if (current.trim()) {
        results.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }
  }

  // Push last item
  if (current.trim()) {
    results.push(current.trim());
  }

  return results;
};

const InputArea: React.FC<InputAreaProps> = ({ 
  onTranslate, 
  isTranslating, 
  provider, 
  onProviderChange, 
  onOpenSettings,
  selectedLanguages,
  onLanguagesChange,
  onOpenLanguages
}) => {
  const [inputText, setInputText] = useState('');
  const [splitMode, setSplitMode] = useState<SplitMode>('AUTO');

  const handleTranslate = () => {
    if (!inputText.trim()) return;
    
    let items: string[] = [];

    // Mode-specific splitting logic
    if (splitMode === 'AUTO') {
      if (inputText.includes(SEPARATOR_DISPLAY)) {
         items = inputText
          .split(SEPARATOR_DISPLAY)
          .map(block => block.trim())
          .filter(block => block.length > 0);
      } 
      else if (inputText.includes('"')) {
        items = parseMixedInput(inputText);
      }
      else if (/\n\s*\n/.test(inputText)) {
        items = inputText
          .split(/\n\s*\n/)
          .map(block => block.trim())
          .filter(block => block.length > 0);
      }
      else {
        items = inputText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      }
    } else if (splitMode === 'LINE') {
      items = inputText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    } else if (splitMode === 'PARAGRAPH') {
      items = inputText
        .split(/\n\s*\n/)
        .map(block => block.trim())
        .filter(block => block.length > 0);
    }
      
    if (items.length > 0) {
      onTranslate(items);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const htmlData = e.clipboardData.getData('text/html');
    if (htmlData && (htmlData.includes('<table') || htmlData.includes('<tr'))) {
      e.preventDefault();
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlData, 'text/html');
        const rows = doc.querySelectorAll('tr');
        const extractedItems: string[] = [];
        
        rows.forEach(row => {
          const cell = row.querySelector('td');
          if (cell) {
             const text = cell.innerText.trim();
             if (text) extractedItems.push(text);
          }
        });

        if (extractedItems.length > 0) {
          const joinedText = extractedItems.join(SEPARATOR_TOKEN);
          setInputText(prev => prev ? prev + SEPARATOR_TOKEN + joinedText : joinedText);
          setSplitMode('AUTO'); 
          return;
        }
      } catch (err) {
        console.error("Failed to parse Excel HTML", err);
      }
    }
  };

  const handleClear = useCallback(() => {
    if (window.confirm("确定要清空输入内容吗？")) {
      setInputText('');
    }
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col space-y-3 flex-none">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-slate-700 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-blue-600" />
            源文本 (Source)
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={onOpenLanguages}
              className="flex items-center space-x-1 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-300 px-2 py-1 rounded-md text-xs font-medium transition-colors"
              title="选择目标语言"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{selectedLanguages.length} 语言</span>
            </button>
            <button 
              onClick={handleClear}
              className="text-slate-400 hover:text-red-500 transition-colors ml-2"
              title="清空输入"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Engine Selection */}
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => onProviderChange('GEMINI')}
            className={`flex-1 flex items-center justify-center space-x-2 py-1.5 rounded-md text-xs font-semibold transition-all ${
              provider === 'GEMINI' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>Gemini AI</span>
          </button>
          <button
            onClick={() => onProviderChange('TENCENT')}
            className={`flex-1 flex items-center justify-center space-x-2 py-1.5 rounded-md text-xs font-semibold transition-all ${
              provider === 'TENCENT' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Cloud className="w-3 h-3" />
            <span>腾讯云 TMT</span>
          </button>
        </div>

        {/* Split Mode Selection */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
           <button
             onClick={() => setSplitMode('AUTO')}
             className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
               splitMode === 'AUTO' ? 'bg-white text-slate-800 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
             }`}
             title="智能识别：支持 Excel 粘贴的混合内容"
           >
             <Layers className="w-3 h-3" />
             <span>自动 / 混合</span>
           </button>
           <button
             onClick={() => setSplitMode('LINE')}
             className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
               splitMode === 'LINE' ? 'bg-white text-slate-800 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
             }`}
             title="强制每行作为一个独立条目"
           >
             <List className="w-3 h-3" />
             <span>按行</span>
           </button>
           <button
             onClick={() => setSplitMode('PARAGRAPH')}
             className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
               splitMode === 'PARAGRAPH' ? 'bg-white text-slate-800 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
             }`}
             title="按空行（双回车）分隔"
           >
             <AlignLeft className="w-3 h-3" />
             <span>按段落</span>
           </button>
        </div>
      </div>
      
      <div className="flex-grow p-0 relative group min-h-0">
        <textarea
          className="w-full h-full p-4 resize-none focus:ring-0 focus:outline-none text-slate-700 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto"
          placeholder={
            splitMode === 'AUTO' 
              ? "在此粘贴内容。\n\n提示：\n- 从 Excel 粘贴可保持行结构。\n- 自动识别多行单元格（带引号）。\n- 使用双换行符分隔段落。"
              : splitMode === 'LINE'
              ? "在此粘贴内容。\n每一行都将被单独翻译。"
              : "在此粘贴内容。\n使用双空行分隔段落。"
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onPaste={handlePaste}
          disabled={isTranslating}
        />
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex-none">
        <button
          onClick={handleTranslate}
          disabled={isTranslating || !inputText.trim()}
          className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium text-white shadow-sm transition-all
            ${isTranslating || !inputText.trim() 
              ? 'bg-slate-400 cursor-not-allowed' 
              : provider === 'TENCENT' 
                ? 'bg-teal-600 hover:bg-teal-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isTranslating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在处理 ({provider === 'GEMINI' ? 'Gemini' : 'Tencent'})...
            </>
          ) : (
            <>
              开始翻译 ({provider === 'GEMINI' ? 'Gemini' : 'Tencent'})
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputArea;
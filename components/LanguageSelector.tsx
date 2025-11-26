import React from 'react';
import { X, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguages: string[];
  onChange: (langs: string[]) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isOpen, onClose, selectedLanguages, onChange }) => {
  if (!isOpen) return null;

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      // Don't allow empty selection
      if (selectedLanguages.length > 1) {
        onChange(selectedLanguages.filter(c => c !== code));
      }
    } else {
      // Sort based on original supported order to keep UI consistent
      const newSelection = [...selectedLanguages, code];
      const sorted = SUPPORTED_LANGUAGES
        .filter(l => newSelection.includes(l.code))
        .map(l => l.code);
      onChange(sorted);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-700">
          <h3 className="text-white font-semibold text-lg">选择目标语言</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguages.includes(lang.code);
              return (
                <button
                  key={lang.code}
                  onClick={() => toggleLanguage(lang.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200 text-blue-800' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium">{lang.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
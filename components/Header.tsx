import React from 'react';
import { Factory, Globe, Settings } from 'lucide-react';
import { APP_NAME } from '../constants';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenLanguages: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenLanguages }) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Factory className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{APP_NAME}</h1>
            <p className="text-xs text-slate-400">工业级翻译引擎</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-slate-300">
           <button 
             onClick={onOpenLanguages}
             className="hidden md:flex items-center space-x-1 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors"
             title="选择目标语言"
           >
             <Globe className="h-4 w-4" />
             <span>多语言支持</span>
           </button>
           
           <div className="h-6 w-px bg-slate-700 mx-2 hidden md:block"></div>

           <button 
             onClick={onOpenSettings}
             className="flex items-center space-x-1 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors"
             title="配置翻译引擎"
           >
             <Settings className="h-5 w-5" />
             <span className="hidden sm:inline">设置</span>
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
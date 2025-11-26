import React, { useState, useEffect } from 'react';
import { X, Save, ShieldCheck, RefreshCw } from 'lucide-react';
import { TencentConfig, TENCENT_REGIONS } from '../types';
import { PRESET_TENCENT_CONFIG } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TencentConfig) => void;
  currentConfig: TencentConfig | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentConfig }) => {
  const [secretId, setSecretId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [region, setRegion] = useState('ap-guangzhou');

  useEffect(() => {
    if (currentConfig) {
      setSecretId(currentConfig.secretId);
      setSecretKey(currentConfig.secretKey);
      setRegion(currentConfig.region);
    }
  }, [currentConfig, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!secretId.trim() || !secretKey.trim()) {
      alert("请输入 SecretId 和 SecretKey");
      return;
    }
    onSave({ secretId, secretKey, region });
    onClose();
  };

  const hasPreset = !!(PRESET_TENCENT_CONFIG.secretId && PRESET_TENCENT_CONFIG.secretKey);
  const handleLoadPreset = () => {
    setSecretId(PRESET_TENCENT_CONFIG.secretId);
    setSecretKey(PRESET_TENCENT_CONFIG.secretKey);
    setRegion(PRESET_TENCENT_CONFIG.region);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-700">
          <h3 className="text-white font-semibold text-lg">腾讯云 API 设置</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start space-x-3 text-emerald-800 text-xs">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong>CORS 代理已启用：</strong> 请求将通过 <code>corsproxy.io</code> 安全路由，以绕过浏览器的跨域限制。<br/>
              请确保您的腾讯云密钥拥有 <code>tmt:TextTranslateBatch</code> 权限。
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
               <label className="block text-sm font-medium text-slate-700">SecretId</label>
               {hasPreset && (
                 <button 
                   onClick={handleLoadPreset}
                   className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                   title="从 constants.ts 加载"
                 >
                   <RefreshCw className="w-3 h-3 mr-1" />
                   加载内置配置
                 </button>
               )}
            </div>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              placeholder="AKID..."
              value={secretId}
              onChange={e => setSecretId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SecretKey</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              placeholder="您的 Secret Key"
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">地域 (Region)</label>
            <select 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              value={region}
              onChange={e => setRegion(e.target.value)}
            >
              {TENCENT_REGIONS.map(r => (
                <option key={r.value} value={r.value}>{r.label} ({r.value})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200 text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
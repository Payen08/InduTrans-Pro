import React from 'react';
import { TranslationResult } from '../types';
import { Download, Table as TableIcon, Copy, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants';
import * as XLSX from 'xlsx';

interface ResultsTableProps {
  results: TranslationResult[];
  selectedLanguages: string[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, selectedLanguages }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleExport = () => {
    if (results.length === 0) return;

    // Build dynamic header map
    const data = results.map(item => {
      const row: any = { "原文": item.original };
      selectedLanguages.forEach(code => {
        const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
        row[lang?.name || code] = item.translations[code];
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Translations");
    
    // Auto-width columns
    const wscols = [{ wch: 40 }, ...selectedLanguages.map(() => ({ wch: 40 }))];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `InduTrans_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col items-center justify-center text-slate-400 p-8">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <TableIcon className="w-12 h-12 text-slate-300" />
        </div>
        <p className="text-lg font-medium text-slate-500">暂无翻译</p>
        <p className="text-sm">请在左侧输入文本以开始处理。</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-semibold text-slate-700 flex items-center">
          <TableIcon className="w-4 h-4 mr-2 text-blue-600" />
          翻译结果 ({results.length})
        </h2>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>导出 Excel</span>
        </button>
      </div>

      <div className="flex-grow overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 font-semibold text-slate-600 text-sm border-b border-slate-200 min-w-[200px]">
                原文 (CN)
              </th>
              {selectedLanguages.map(code => {
                const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                return (
                  <th key={code} className="p-4 font-semibold text-slate-600 text-sm border-b border-slate-200 min-w-[200px]">
                    {lang?.name || code}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((row) => (
              <tr key={row.id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="p-4 text-slate-800 font-medium align-top whitespace-pre-wrap text-sm leading-relaxed">
                  {row.original}
                </td>
                {selectedLanguages.map(code => (
                  <td key={code} className={`p-4 align-top whitespace-pre-wrap text-sm leading-relaxed ${code === 'literal' ? 'italic bg-slate-50/30 text-slate-600' : 'text-slate-700'}`}>
                    <div className="flex justify-between items-start">
                      <span>{row.translations[code]}</span>
                      <button 
                        onClick={() => copyToClipboard(row.translations[code], `${row.id}-${code}`)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity ml-2 flex-shrink-0"
                      >
                        {copiedId === `${row.id}-${code}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
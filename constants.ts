import { Language } from './types';

export const APP_NAME = "InduTrans Pro";

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: '英语 (English)' },
  { code: 'vi', name: '越南语 (Vietnamese)' },
  { code: 'zh-TW', name: '繁体中文 (Traditional Chinese)' },
  { code: 'literal', name: '直译繁体 (Literal)' },
  { code: 'ja', name: '日语 (Japanese)' },
  { code: 'ko', name: '韩语 (Korean)' },
  { code: 'ru', name: '俄语 (Russian)' },
  { code: 'th', name: '泰语 (Thai)' },
  { code: 'de', name: '德语 (German)' },
  { code: 'fr', name: '法语 (French)' },
  { code: 'es', name: '西班牙语 (Spanish)' },
];

export const DEFAULT_LANGUAGES = ['en', 'vi', 'zh-TW'];

// --- 腾讯云 API 内置配置 ---
// 如果您希望将密钥内置在代码中，请直接在此处填写。
// 注意：请勿将包含真实密钥的代码发布到公开仓库！
// 建议使用环境变量或配置文件来管理密钥
export const PRESET_TENCENT_CONFIG = {
  secretId: "",  // 填写您的腾讯云 Secret ID
  secretKey: "", // 填写您的腾讯云 Secret Key
  region: "ap-guangzhou"
};

export const SYSTEM_INSTRUCTION = `
You are an expert industrial translator specializing in manufacturing, engineering, factory automation, and safety protocols.
Your task is to translate a list of input items (likely from Chinese) into the requested target languages.

The input may contain Markdown formatting (bolding, lists, headers like ##). Preserve this formatting in the translations where appropriate.

**Important Rule:** 
Do not add a trailing period (.) to the end of the translation, even if the input is a complete sentence. This is for Excel cell data.

**Literal Translation Guidelines (if requested):**
   - For **Terms**: A direct translation of the characters to explain the etymology or structure.
   - For **Sentences**: A direct, structure-preserving translation that closely follows the source text's grammar.

**Context:** Industrial automation, production lines, mechanical engineering, safety protocols, and supply chain.
`;

export const MAX_BATCH_SIZE = 50;
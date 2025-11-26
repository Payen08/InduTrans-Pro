export interface TranslationResult {
  id: string;
  original: string;
  translations: { [langCode: string]: string }; // Dynamic key-value pairs for languages
  category?: string;
}

export interface Language {
  code: string;
  name: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  TRANSLATING = 'TRANSLATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface TranslationRequest {
  texts: string[];
}

export type TranslationProvider = 'GEMINI' | 'TENCENT';

export interface TencentConfig {
  secretId: string;
  secretKey: string;
  region: string;
}

export const TENCENT_REGIONS = [
  { value: 'ap-guangzhou', label: 'Guangzhou' },
  { value: 'ap-shanghai', label: 'Shanghai' },
  { value: 'ap-beijing', label: 'Beijing' },
  { value: 'ap-hongkong', label: 'Hong Kong' },
  { value: 'ap-singapore', label: 'Singapore' },
  { value: 'na-siliconvalley', label: 'Silicon Valley' },
];

import { TranslationResult, TencentConfig } from "../types";

// Declare CryptoJS from global scope (loaded via script tag)
declare const CryptoJS: any;

const TMT_HOST = "tmt.tencentcloudapi.com";
const SERVICE = "tmt";
const ACTION = "TextTranslateBatch";
const VERSION = "2018-03-21";
const CORS_PROXY = "https://corsproxy.io/?";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getSignature = (secretKey: string, date: string, service: string, strToSign: string) => {
  const kDate = CryptoJS.HmacSHA256(date, "TC3" + secretKey);
  const kService = CryptoJS.HmacSHA256(service, kDate);
  const kSigning = CryptoJS.HmacSHA256("tc3_request", kService);
  return CryptoJS.HmacSHA256(strToSign, kSigning).toString(CryptoJS.enc.Hex);
};

const cleanText = (text: string) => {
  if (!text) return "";
  return text.trim().replace(/\.$/, '');
};

const callTencentAPI = async (
  texts: string[],
  targetLang: string,
  config: TencentConfig
): Promise<string[]> => {
  if (texts.length === 0) return [];
  // Updated text to Chinese as requested previously
  if (targetLang === 'literal') return new Array(texts.length).fill("不支持 (仅 Gemini 可用)");

  // Tencent uses slightly different codes? 'zh-TW' is standard. 'vi' is standard.
  // We assume the codes in constants.ts match Tencent or we'd need a mapper.
  // SUPPORTED: en, vi, ja, ko, ru, th, de, fr, es, zh-TW are all standard TMT codes.

  const BATCH_LIMIT = 5;
  const allResults: string[] = new Array(texts.length).fill("");
  const batches = [];
  
  for (let i = 0; i < texts.length; i += BATCH_LIMIT) {
    batches.push({
      indices: Array.from({ length: Math.min(BATCH_LIMIT, texts.length - i) }, (_, k) => i + k),
      data: texts.slice(i, i + BATCH_LIMIT)
    });
  }

  for (const batch of batches) {
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10);

    const payload = {
      Source: "auto",
      Target: targetLang,
      ProjectId: 0,
      SourceTextList: batch.data,
    };
    const payloadStr = JSON.stringify(payload);

    const canonicalHeaders = `content-type:application/json\nhost:${TMT_HOST}\n`;
    const signedHeaders = "content-type;host";
    const hashedRequestPayload = CryptoJS.SHA256(payloadStr).toString(CryptoJS.enc.Hex);
    const canonicalRequest = `POST\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;
    const credentialScope = `${date}/${SERVICE}/tc3_request`;
    const hashedCanonicalRequest = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);
    const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;
    const signature = getSignature(config.secretKey, date, SERVICE, stringToSign);
    const authorization = `TC3-HMAC-SHA256 Credential=${config.secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    try {
      const res = await fetch(`${CORS_PROXY}https://${TMT_HOST}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authorization,
          "X-TC-Action": ACTION,
          "X-TC-Version": VERSION,
          "X-TC-Timestamp": timestamp.toString(),
          "X-TC-Region": config.region,
        },
        body: payloadStr,
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const json = await res.json();
      if (json.Response && json.Response.Error) {
        throw new Error(`Tencent API Error: ${json.Response.Error.Message}`);
      }
      if (json.Response && json.Response.TargetTextList) {
        json.Response.TargetTextList.forEach((text: string, idx: number) => {
          allResults[batch.indices[idx]] = cleanText(text);
        });
      }

      // Add delay to prevent hitting 5QPS rate limit
      // 300ms delay ensures ~3 requests/sec max per thread
      await delay(300);

    } catch (e: any) {
      console.error("Tencent API Call Failed", e);
      if (e.message && e.message.includes('Failed to fetch')) {
        throw new Error("Network Error (CORS Proxy/Connection)");
      }
      throw e;
    }
  }
  return allResults;
};

export const translateBatchTencent = async (texts: string[], targetLanguages: string[], config: TencentConfig): Promise<TranslationResult[]> => {
  try {
    // Execute sequentially to avoid rate limits (Promise.all would fire all at once)
    const resultsArrays: string[][] = [];
    for (const lang of targetLanguages) {
      const langResults = await callTencentAPI(texts, lang, config);
      resultsArrays.push(langResults);
    }

    return texts.map((original, index) => {
      const translations: { [key: string]: string } = {};
      targetLanguages.forEach((lang, langIdx) => {
        translations[lang] = resultsArrays[langIdx][index] || "";
      });

      return {
        id: `tencent-${Date.now()}-${index}`,
        original,
        translations
      };
    });

  } catch (error) {
    console.error("Tencent Translation Error", error);
    throw error;
  }
};
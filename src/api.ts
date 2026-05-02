import OpenAI from 'openai';
import type { Settings } from './types';

let _client: OpenAI | null = null;
let _settings: Settings | null = null;

export function getClient(settings: Settings): OpenAI {
  if (
    !_client ||
    settings.baseURL !== _settings?.baseURL ||
    settings.apiKey !== _settings?.apiKey
  ) {
    // Делаем URL абсолютным, если он начинается с '/'
    const finalBaseUrl = settings.baseURL.startsWith('/') 
      ? window.location.origin + settings.baseURL 
      : settings.baseURL;

    _client = new OpenAI({
      baseURL: finalBaseUrl,
      // Если ключ пустой, передаем заглушку, иначе SDK может тоже выдать ошибку
      apiKey: settings.apiKey || 'dummy-key', 
      dangerouslyAllowBrowser: true,
    });
    _settings = { ...settings };
  }
  return _client;
}
import { wrapLanguageModel, customProvider, extractReasoningMiddleware } from 'ai';

import { createOpenAI } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { groq } from '@ai-sdk/groq';
import { createAnthropic } from '@ai-sdk/anthropic';
import { mistral } from '@ai-sdk/mistral';
import { google } from '@ai-sdk/google';
import { serverEnv } from '@/env/server';

const middleware = extractReasoningMiddleware({
  tagName: 'think',
});

const middlewareWithStartWithReasoning = extractReasoningMiddleware({
  tagName: 'think',
  startWithReasoning: true,
});

const anthropic = createAnthropic({
  headers: {
    'anthropic-beta': 'context-1m-2025-08-07',
  },
});

const huggingface = createOpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: process.env.HF_TOKEN,
});

export const miami = customProvider({
  languageModels: {
    'miami-default': xai('grok-4-fast-non-reasoning'),
    'miami-nano': groq('llama-3.3-70b-versatile'),
    'miami-name': huggingface.chat('meta-llama/Llama-3.3-70B-Instruct:cerebras'),
    'miami-grok-3': xai('grok-3'),
    'miami-grok-4': xai('grok-4'),
    'miami-grok-4-fast': xai('grok-4-fast-non-reasoning'),
    'miami-grok-4-fast-think': xai('grok-4-fast'),
    'miami-code': xai('grok-code-fast-1'),
    'miami-enhance': groq('moonshotai/kimi-k2-instruct'),
    'miami-qwen-4b': huggingface.chat('Qwen/Qwen3-4B-Instruct-2507:nscale'),
    'miami-qwen-4b-thinking': wrapLanguageModel({
      model: huggingface.chat('Qwen/Qwen3-4B-Thinking-2507:nscale'),
      middleware: [middlewareWithStartWithReasoning],
    }),
    'miami-qwen-32b': wrapLanguageModel({
      model: groq('qwen/qwen3-32b'),
      middleware,
    }),
    'miami-gpt-oss-20': wrapLanguageModel({
      model: groq('openai/gpt-oss-20b'),
      middleware,
    }),
    'miami-gpt-oss-120': wrapLanguageModel({
      model: groq('openai/gpt-oss-120b'),
      middleware,
    }),
    'miami-deepseek-chat': huggingface.chat('deepseek-ai/DeepSeek-V3.1-Terminus:novita'),
    'miami-qwen-coder-small': huggingface.chat('Qwen/Qwen3-Coder-30B-A3B-Instruct:fireworks-ai'),
    'miami-qwen-coder': huggingface.chat('Qwen/Qwen3-Coder-480B-A35B-Instruct:cerebras'),
    'miami-qwen-30': huggingface.chat('Qwen/Qwen3-30B-A3B-Instruct-2507:nebius'),
    'miami-qwen-30-think': wrapLanguageModel({
      model: huggingface.chat('Qwen/Qwen3-30B-A3B-Thinking-2507:nebius'),
      middleware,
    }),
    'miami-qwen-3-next': huggingface.chat('Qwen/Qwen3-Next-80B-A3B-Instruct:hyperbolic'),
    'miami-qwen-235': huggingface.chat('Qwen/Qwen3-235B-A22B-Instruct-2507:fireworks-ai'),
    'miami-qwen-235-think': wrapLanguageModel({
      model: huggingface.chat('Qwen/Qwen3-235B-A22B-Thinking-2507:fireworks-ai'),
      middleware: [middlewareWithStartWithReasoning],
    }),
    'miami-glm-air': huggingface.chat('zai-org/GLM-4.5-Air:fireworks-ai'),
    'miami-glm': wrapLanguageModel({
      model: huggingface.chat('zai-org/GLM-4.5:fireworks-ai'),
      middleware,
    }),
    'miami-kimi-k2': groq('moonshotai/kimi-k2-instruct-0905'),
    'miami-kimi-k2-v2': groq('moonshotai/kimi-k2-instruct-0905'),
    'miami-haiku': anthropic('claude-3-5-haiku-20241022'),
    'miami-mistral-medium': mistral('mistral-medium-2508'),
    'miami-magistral-small': mistral('magistral-small-2509'),
    'miami-magistral-medium': mistral('magistral-medium-2509'),
    'miami-google-lite': google('gemini-2.5-flash-lite'),
    'miami-google': google('gemini-2.5-flash'),
    'miami-google-pro': google('gemini-2.5-pro'),
    'miami-anthropic-3': anthropic('claude-3-7-sonnet-20250219'),
    'miami-anthropic': anthropic('claude-sonnet-4-20250514'),
    'miami-llama-4': groq('meta-llama/llama-4-maverick-17b-128e-instruct'),
  },
});

interface ModelParameters {
  temperature?: number;
  topP?: number;
  topK?: number;
  minP?: number;
  frequencyPenalty?: number;
}

interface Model {
  value: string;
  label: string;
  description: string;
  vision: boolean;
  reasoning: boolean;
  experimental: boolean;
  category: string;
  pdf: boolean;
  pro: boolean;
  requiresAuth: boolean;
  freeUnlimited: boolean;
  maxOutputTokens: number;
  // Tags
  fast?: boolean;
  isNew?: boolean;
  parameters?: ModelParameters;
}

export const models: Model[] = [
  // Models (xAI)
  {
    value: 'miami-grok-3',
    label: 'Grok 3',
    description: "xAI's recent smartest LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
  },
  {
    value: 'miami-grok-4',
    label: 'Grok 4',
    description: "xAI's most intelligent LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
  },
  {
    value: 'miami-default',
    label: 'Grok 4 Fast',
    description: "xAI's fastest intelligent vision LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Free',
    pdf: false,
    pro: false,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 16000,
    fast: true,
  },
  {
    value: 'miami-grok-4-fast-think',
    label: 'Grok 4 Fast Thinking',
    description: "xAI's fastest intelligent vision LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
    fast: true,
  },
  {
    value: 'miami-qwen-32b',
    label: 'Qwen 3 32B',
    description: "Alibaba's advanced reasoning LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Free',
    pdf: false,
    pro: false,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 40960,
    fast: true,
    parameters: {
      temperature: 0.6,
      topP: 0.95,
      minP: 0,
    },
  },
  {
    value: 'miami-qwen-4b',
    label: 'Qwen 3 4B',
    description: "Alibaba's small base LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Free',
    pdf: false,
    pro: false,
    requiresAuth: false,
    maxOutputTokens: 16000,
    freeUnlimited: false,
    parameters: {
      temperature: 0.7,
      topP: 0.8,
      topK: 20,
      minP: 0,
    },
  },
  {
    value: 'miami-qwen-4b-thinking',
    label: 'Qwen 3 4B Thinking',
    description: "Alibaba's small base LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Free',
    pdf: false,
    pro: false,
    requiresAuth: true,
    maxOutputTokens: 16000,
    freeUnlimited: false,
    parameters: {
      temperature: 0.6,
      topP: 0.95,
      topK: 20,
      minP: 0,
    },
  },
  {
    value: 'miami-gpt-oss-20',
    label: 'GPT OSS 20B',
    description: "OpenAI's small OSS LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Free',
    pdf: false,
    pro: false,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
    fast: true,
  },
  {
    value: 'miami-google-lite',
    label: 'Gemini 2.5 Flash Lite',
    description: "Google's advanced small LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Free',
    pdf: true,
    pro: false,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 10000,
  },
  {
    value: 'miami-code',
    label: 'Grok Code',
    description: "xAI's advanced coding LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
    fast: true,
  },
  {
    value: 'miami-mistral-medium',
    label: 'Mistral Medium',
    description: "Mistral's medium multi-modal LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
  },
  {
    value: 'miami-magistral-small',
    label: 'Magistral Small',
    description: "Mistral's small reasoning LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
  },
  {
    value: 'miami-magistral-medium',
    label: 'Magistral Medium',
    description: "Mistral's medium reasoning LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
  },
  {
    value: 'miami-gpt-oss-120',
    label: 'GPT OSS 120B',
    description: "OpenAI's advanced OSS LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
    fast: true,
  },
  {
    value: 'miami-deepseek-chat',
    label: 'DeepSeek Chat',
    description: "DeepSeek's advanced chat LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
  },
  {
    value: 'miami-qwen-coder',
    label: 'Qwen 3 Coder 480B-A35B',
    description: "Alibaba's advanced coding LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 130000,
    fast: true,
  },
  {
    value: 'miami-anthropic-3',
    label: 'Claude 3.7 Sonnet',
    description: "Anthropic's recent advanced LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 8000,
  },
  {
    value: 'miami-anthropic',
    label: 'Claude 4 Sonnet',
    description: "Anthropic's most advanced LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 8000,
  },
  {
    value: 'miami-qwen-3-next',
    label: 'Qwen 3 Next 80B A3B Instruct',
    description: "Qwen's advanced instruct LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 100000,
    fast: true,
    isNew: true,
    parameters: {
      temperature: 0.7,
      topP: 0.8,
      minP: 0,
    },
  },
  {
    value: 'miami-qwen-235',
    label: 'Qwen 3 235B A22B',
    description: "Qwen's advanced instruct LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 100000,
    parameters: {
      temperature: 0.7,
      topP: 0.8,
      minP: 0,
    },
  },
  {
    value: 'miami-qwen-235-think',
    label: 'Qwen 3 235B A22B Thinking',
    description: "Qwen's advanced thinking LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 100000,
    parameters: {
      temperature: 0.6,
      topP: 0.95,
      minP: 0,
    },
  },
  {
    value: 'miami-kimi-k2-v2',
    label: 'Kimi K2 Latest',
    description: "MoonShot AI's advanced base LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 10000,
    fast: true,
    parameters: {
      temperature: 0.6,
    },
  },
  {
    value: 'miami-glm-air',
    label: 'GLM 4.5 Air',
    description: "Zhipu AI's efficient base LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 130000,
  },
  {
    value: 'miami-glm',
    label: 'GLM 4.5',
    description: "Zhipu AI's advanced base LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: false,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 13000,
  },
  {
    value: 'miami-google',
    label: 'Gemini 2.5 Flash',
    description: "Google's advanced small LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 10000,
  },
  {
    value: 'miami-google-pro',
    label: 'Gemini 2.5 Pro',
    description: "Google's most advanced LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 10000,
  },
];

// Helper functions for model access checks
export function getModelConfig(modelValue: string) {
  return models.find((model) => model.value === modelValue);
}

export function requiresAuthentication(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.requiresAuth || false;
}

export function requiresProSubscription(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.pro || false;
}

export function isFreeUnlimited(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.freeUnlimited || false;
}

export function hasVisionSupport(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.vision || false;
}

export function hasPdfSupport(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.pdf || false;
}

export function hasReasoningSupport(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.reasoning || false;
}

export function isExperimentalModel(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.experimental || false;
}

export function getMaxOutputTokens(modelValue: string): number {
  const model = getModelConfig(modelValue);
  return model?.maxOutputTokens || 8000;
}

export function getModelParameters(modelValue: string): ModelParameters {
  const model = getModelConfig(modelValue);
  return model?.parameters || {};
}

// Access control helper
export function canUseModel(modelValue: string, user: any, isProUser: boolean): { canUse: boolean; reason?: string } {
  const model = getModelConfig(modelValue);

  if (!model) {
    return { canUse: false, reason: 'Model not found' };
  }

  // Check if model requires authentication
  if (model.requiresAuth && !user) {
    return { canUse: false, reason: 'authentication_required' };
  }

  // Check if model requires Pro subscription
  if (model.pro && !isProUser) {
    return { canUse: false, reason: 'pro_subscription_required' };
  }

  return { canUse: true };
}

// Helper to check if user should bypass rate limits
export function shouldBypassRateLimits(modelValue: string, user: any): boolean {
  const model = getModelConfig(modelValue);
  return Boolean(user && model?.freeUnlimited);
}

// Get acceptable file types for a model
export function getAcceptedFileTypes(modelValue: string, isProUser: boolean): string {
  const model = getModelConfig(modelValue);
  if (model?.pdf && isProUser) {
    return 'image/*,.pdf';
  }
  return 'image/*';
}

// Legacy arrays for backward compatibility (deprecated - use helper functions instead)
export const authRequiredModels = models.filter((m) => m.requiresAuth).map((m) => m.value);
export const proRequiredModels = models.filter((m) => m.pro).map((m) => m.value);
export const freeUnlimitedModels = models.filter((m) => m.freeUnlimited).map((m) => m.value);

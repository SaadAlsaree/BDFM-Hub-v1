import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';
import { SearchResult, ConversationMessage } from '../models';

interface GenerateOptions {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export class LLMService {
  private ollamaUrl: string;
  private model: string;

  constructor() {
    this.ollamaUrl = config.ollama.url;
    this.model = config.ollama.chatModel;
  }

  /**
   * Generate answer using LLM
   */
  async generateAnswer(
    query: string,
    context: SearchResult[],
    language: 'ar' | 'en' = 'ar',
    options?: GenerateOptions
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(language);
      const userPrompt = this.buildUserPrompt(query, context, language);

      logger.info(
        `Generating answer for query: "${query.substring(0, 50)}..."`
      );

      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt: `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
          stream: false,
          options: {
            temperature: options?.temperature || 0.7,
            top_p: options?.topP || 0.9,
            num_predict: options?.maxTokens || 512,
          },
        },
        {
          timeout: config.ollama.timeout,
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error('Invalid response from Ollama');
      }

      const answer = this.cleanAnswer(response.data.response);
      logger.info('Answer generated successfully');

      return answer;
    } catch (error: any) {
      logger.error('Error generating answer:', error.message);
      throw new Error(`Failed to generate answer: ${error.message}`);
    }
  }

  /**
   * Generate answer with streaming
   */
  async *generateAnswerStream(
    query: string,
    context: SearchResult[],
    language: 'ar' | 'en' = 'ar',
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    try {
      const systemPrompt = this.buildSystemPrompt(language);
      const userPrompt = this.buildUserPrompt(query, context, language);

      logger.info(
        `Generating streaming answer for query: "${query.substring(0, 50)}..."`
      );

      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt: `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
          stream: true,
          options: {
            temperature: options?.temperature || 0.7,
            top_p: options?.topP || 0.9,
            num_predict: options?.maxTokens || 512,
          },
        },
        {
          timeout: config.ollama.timeout,
          responseType: 'stream',
        }
      );

      // Process streaming response
      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              yield data.response;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error: any) {
      logger.error('Error generating streaming answer:', error.message);
      throw new Error(`Failed to generate streaming answer: ${error.message}`);
    }
  }

  /**
   * Build system prompt
   */
  private buildSystemPrompt(language: 'ar' | 'en'): string {
    if (language === 'ar') {
      return `أنت مساعد ذكي متخصص في نظام إدارة المراسلات BDFM.Hub.
مهمتك هي مساعدة المستخدمين في البحث عن المراسلات والإجابة على أسئلتهم بناءً على السياق المقدم.

تعليمات مهمة:
1. أجب باللغة العربية بوضوح ودقة
2. استخدم المعلومات من السياق المقدم فقط
3. إذا لم تجد إجابة في السياق، قل ذلك بصراحة
4. اذكر أرقام المراسلات عند الإمكان
5. كن مهذباً ومفيداً في إجاباتك
6. قدم معلومات دقيقة ومنظمة`;
    } else {
      return `You are an intelligent assistant specialized in the BDFM.Hub correspondence management system.
Your task is to help users search for correspondence and answer their questions based on the provided context.

Important instructions:
1. Answer clearly and accurately
2. Use only information from the provided context
3. If you cannot find an answer in the context, state that clearly
4. Mention correspondence numbers when possible
5. Be polite and helpful in your responses
6. Provide accurate and organized information`;
    }
  }

  /**
   * Build user prompt with context
   */
  private buildUserPrompt(
    query: string,
    context: SearchResult[],
    language: 'ar' | 'en'
  ): string {
    const contextText = this.buildContextText(context, language);

    if (language === 'ar') {
      return `السياق من المراسلات ذات الصلة:

${contextText}

السؤال: ${query}

الرجاء الإجابة على السؤال بناءً على السياق المقدم أعلاه. إذا كان السياق لا يحتوي على معلومات كافية، اذكر ذلك بوضوح.`;
    } else {
      return `Context from relevant correspondence:

${contextText}

Question: ${query}

Please answer the question based on the context provided above. If the context does not contain enough information, state that clearly.`;
    }
  }

  /**
   * Build context text from search results
   */
  private buildContextText(
    results: SearchResult[],
    language: 'ar' | 'en'
  ): string {
    const contextParts: string[] = [];

    results.slice(0, 5).forEach((result, index) => {
      if (language === 'ar') {
        contextParts.push(`
المراسلة ${index + 1}:
- الرقم: ${result.mailNum}
- التاريخ: ${result.mailDate}
- الموضوع: ${result.subject}
- المحتوى: ${result.bodyText}
- النوع: ${result.correspondenceType}
- الأولوية: ${result.priorityLevel}
- درجة التشابه: ${(result.similarityScore * 100).toFixed(1)}%
---`);
      } else {
        contextParts.push(`
Correspondence ${index + 1}:
- Number: ${result.mailNum}
- Date: ${result.mailDate}
- Subject: ${result.subject}
- Content: ${result.bodyText}
- Type: ${result.correspondenceType}
- Priority: ${result.priorityLevel}
- Similarity: ${(result.similarityScore * 100).toFixed(1)}%
---`);
      }
    });

    return contextParts.join('\n');
  }

  /**
   * Clean LLM answer
   */
  private cleanAnswer(answer: string): string {
    // Remove any thinking tags or metadata
    let cleaned = answer
      .replace(/<think>.*?<\/think>/gis, '')
      .replace(/\[INST\].*?\[\/INST\]/gis, '')
      .trim();

    return cleaned;
  }

  /**
   * Build conversation system prompt
   */
  private buildConversationSystemPrompt(language: 'ar' | 'en'): string {
    if (language === 'ar') {
      return `أنت مساعد ذكي متخصص في نظام إدارة المراسلات BDFM.Hub.
مهمتك هي مساعدة المستخدمين في البحث عن المراسلات والإجابة على أسئلتهم بناءً على السياق المقدم.

تعليمات مهمة:
1. أنت في محادثة مستمرة مع المستخدم - راعِ سياق المحادثة السابقة
2. أجب باللغة العربية بوضوح ودقة
3. استخدم المعلومات من السياق المقدم والمحادثة السابقة
4. إذا سأل المستخدم عن شيء ذكرته سابقاً، اشر إليه
5. اذكر أرقام المراسلات عند الإمكان
6. كن مهذباً ومفيداً في إجاباتك
7. قدم معلومات دقيقة ومنظمة`;
    } else {
      return `You are an intelligent assistant specialized in the BDFM.Hub correspondence management system.
Your task is to help users search for correspondence and answer their questions based on the provided context.

Important instructions:
1. You are in an ongoing conversation with the user - consider the previous conversation context
2. Answer clearly and accurately
3. Use information from both the provided context and previous conversation
4. If the user asks about something mentioned earlier, reference it
5. Mention correspondence numbers when possible
6. Be polite and helpful in your responses
7. Provide accurate and organized information`;
    }
  }

  /**
   * Build conversation history text
   */
  private buildConversationHistoryText(
    history: ConversationMessage[],
    language: 'ar' | 'en'
  ): string {
    if (history.length === 0) {
      return language === 'ar'
        ? 'لا توجد محادثة سابقة.'
        : 'No previous conversation.';
    }

    const historyParts: string[] = [];

    if (language === 'ar') {
      historyParts.push('المحادثة السابقة:');
      history.forEach((msg) => {
        const role = msg.role === 'user' ? 'المستخدم' : 'المساعد';
        historyParts.push(`\n${role}: ${msg.content}`);
      });
    } else {
      historyParts.push('Previous conversation:');
      history.forEach((msg) => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        historyParts.push(`\n${role}: ${msg.content}`);
      });
    }

    return historyParts.join('\n');
  }

  /**
   * Build conversation user prompt
   */
  private buildConversationUserPrompt(
    query: string,
    contextText: string,
    historyText: string,
    language: 'ar' | 'en'
  ): string {
    if (language === 'ar') {
      return `${historyText}

السياق من المراسلات ذات الصلة:
${contextText}

السؤال الحالي: ${query}

الرجاء الإجابة على السؤال مع مراعاة المحادثة السابقة والسياق المقدم. إذا كان السؤال يتعلق بشيء ذكرناه سابقاً، اشر إليه.`;
    } else {
      return `${historyText}

Context from relevant correspondence:
${contextText}

Current question: ${query}

Please answer the question considering both the previous conversation and the provided context. If the question relates to something mentioned earlier, reference it.`;
    }
  }

  /**
   * Generate answer with conversation context
   */
  async generateAnswerWithConversationContext(
    query: string,
    context: SearchResult[],
    conversationHistory: ConversationMessage[],
    language: 'ar' | 'en' = 'ar',
    options?: GenerateOptions
  ): Promise<string> {
    try {
      const systemPrompt = this.buildConversationSystemPrompt(language);
      const historyText = this.buildConversationHistoryText(
        conversationHistory,
        language
      );
      const contextText = this.buildContextText(context, language);
      const userPrompt = this.buildConversationUserPrompt(
        query,
        contextText,
        historyText,
        language
      );

      logger.info(
        `Generating answer with conversation context (${conversationHistory.length} messages)`
      );

      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt: `${systemPrompt}\n\n${userPrompt}\n\nAssistant:`,
          stream: false,
          options: {
            temperature: options?.temperature || 0.7,
            top_p: options?.topP || 0.9,
            num_predict: options?.maxTokens || 512,
          },
        },
        {
          timeout: config.ollama.timeout,
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error('Invalid response from Ollama');
      }

      const answer = this.cleanAnswer(response.data.response);
      logger.info('Answer with context generated successfully');

      return answer;
    } catch (error: any) {
      logger.error('Error generating answer with context:', error.message);
      throw new Error(`Failed to generate answer: ${error.message}`);
    }
  }

  /**
   * Generate answer stream with conversation context
   */
  async *generateAnswerStreamWithConversationContext(
    query: string,
    context: SearchResult[],
    conversationHistory: ConversationMessage[],
    language: 'ar' | 'en' = 'ar',
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    try {
      const systemPrompt = this.buildConversationSystemPrompt(language);
      const historyText = this.buildConversationHistoryText(
        conversationHistory,
        language
      );
      const contextText = this.buildContextText(context, language);
      const userPrompt = this.buildConversationUserPrompt(
        query,
        contextText,
        historyText,
        language
      );

      logger.info(
        `Generating streaming answer with conversation context`
      );

      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt: `${systemPrompt}\n\n${userPrompt}\n\nAssistant:`,
          stream: true,
          options: {
            temperature: options?.temperature || 0.7,
            top_p: options?.topP || 0.9,
            num_predict: options?.maxTokens || 512,
          },
        },
        {
          timeout: config.ollama.timeout,
          responseType: 'stream',
        }
      );

      // Process streaming response
      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              yield data.response;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error: any) {
      logger.error('Error generating streaming answer with context:', error.message);
      throw new Error(`Failed to generate streaming answer: ${error.message}`);
    }
  }

  /**
   * Check if LLM is available
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      logger.error('LLM connection check failed:', error);
      return false;
    }
  }

  /**
   * Verify chat model is available
   */
  async verifyModel(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: 5000,
      });

      if (response.data && response.data.models) {
        const models = response.data.models.map((m: any) => m.name);
        const isAvailable = models.includes(this.model);

        if (!isAvailable) {
          logger.warn(
            `Chat model ${this.model} is not available. Available models: ${models.join(', ')}`
          );
        }

        return isAvailable;
      }

      return false;
    } catch (error) {
      logger.error('Error verifying chat model:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new LLMService();

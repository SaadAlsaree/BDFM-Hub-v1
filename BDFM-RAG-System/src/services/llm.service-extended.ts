/**
 * Extension to LLM Service for conversation support
 * Add these methods to the existing LLM Service class
 */

import { SearchResult, ConversationMessage } from '../models';
import logger from '../utils/logger';

export class LLMServiceExtension {
  /**
   * Generate answer with conversation context
   */
  async generateAnswerWithConversationContext(
    query: string,
    context: SearchResult[],
    conversationHistory: ConversationMessage[],
    language: 'ar' | 'en' = 'ar',
    options?: any
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

      // Use existing Ollama client
      const response = await (this as any).ollamaClient.post(
        `${(this as any).ollamaUrl}/api/generate`,
        {
          model: (this as any).model,
          prompt: `${systemPrompt}\n\n${userPrompt}\n\nAssistant:`,
          stream: false,
          options: {
            temperature: options?.temperature || 0.7,
            top_p: options?.topP || 0.9,
            num_predict: options?.maxTokens || 512,
          },
        },
        {
          timeout: (this as any).config.ollama.timeout,
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
    options?: any
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

      // Implementation would use existing streaming logic
      // This is a placeholder showing the structure
      yield* (this as any).generateAnswerStream(query, context, language, options);
    } catch (error: any) {
      logger.error('Error generating streaming answer with context:', error.message);
      throw new Error(`Failed to generate streaming answer: ${error.message}`);
    }
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
      history.forEach((msg, index) => {
        const role = msg.role === 'user' ? 'المستخدم' : 'المساعد';
        historyParts.push(`\n${role}: ${msg.content}`);
      });
    } else {
      historyParts.push('Previous conversation:');
      history.forEach((msg, index) => {
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

  // Helper method from original service
  private buildContextText(results: SearchResult[], language: 'ar' | 'en'): string {
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

  private cleanAnswer(answer: string): string {
    let cleaned = answer
      .replace(/<think>.*?<\/think>/gis, '')
      .replace(/\[INST\].*?\[\/INST\]/gis, '')
      .trim();

    return cleaned;
  }
}

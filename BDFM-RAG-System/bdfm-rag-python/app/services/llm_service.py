"""LLM service using Ollama for text generation"""
import httpx
from typing import List, Dict, Any, AsyncGenerator, Optional
from app.config import settings
from app.utils.logger import logger
from app.models import SearchResult, ConversationMessage


class LLMService:
    """Service for LLM text generation using Ollama"""
    
    def __init__(self):
        self.ollama_url = settings.ollama_url
        self.chat_model = settings.ollama_chat_model
        self.timeout = settings.ollama_timeout / 1000  # Convert to seconds
        
    async def generate_answer(
        self,
        query: str,
        context: List[SearchResult],
        language: str = "ar",
        temperature: float = 0.7,
        max_tokens: int = 512
    ) -> str:
        """
        توليد إجابة باستخدام LLM
        
        Args:
            query: الاستعلام
            context: نتائج البحث كسياق
            language: اللغة
            temperature: درجة الحرارة
            max_tokens: عدد التوكنات الأقصى
            
        Returns:
            الإجابة المولدة
        """
        try:
            system_prompt = self._build_system_prompt(language)
            user_prompt = self._build_user_prompt(query, context, language)
            
            full_prompt = f"{system_prompt}\n\nUser: {user_prompt}\n\nAssistant:"
            
            logger.info(f"Generating answer for query: {query[:50]}...")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.chat_model,
                        "prompt": full_prompt,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "top_p": 0.9,
                            "num_predict": max_tokens,
                        }
                    }
                )
                
                response.raise_for_status()
                data = response.json()
                
                if not data.get("response"):
                    raise ValueError("Invalid response from Ollama")
                
                answer = self._clean_answer(data["response"])
                logger.info("Answer generated successfully")
                
                return answer
                
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            raise
    
    async def generate_answer_stream(
        self,
        query: str,
        context: List[SearchResult],
        language: str = "ar",
        temperature: float = 0.7,
        max_tokens: int = 512
    ) -> AsyncGenerator[str, None]:
        """
        توليد إجابة مع streaming
        
        Args:
            query: الاستعلام
            context: نتائج البحث
            language: اللغة
            temperature: درجة الحرارة
            max_tokens: عدد التوكنات الأقصى
            
        Yields:
            أجزاء الإجابة
        """
        try:
            system_prompt = self._build_system_prompt(language)
            user_prompt = self._build_user_prompt(query, context, language)
            
            full_prompt = f"{system_prompt}\n\nUser: {user_prompt}\n\nAssistant:"
            
            logger.info(f"Generating streaming answer for query: {query[:50]}...")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.chat_model,
                        "prompt": full_prompt,
                        "stream": True,
                        "options": {
                            "temperature": temperature,
                            "top_p": 0.9,
                            "num_predict": max_tokens,
                        }
                    }
                ) as response:
                    response.raise_for_status()
                    
                    async for line in response.aiter_lines():
                        if line.strip():
                            try:
                                import json
                                data = json.loads(line)
                                if data.get("response"):
                                    yield data["response"]
                            except json.JSONDecodeError:
                                continue
                                
        except Exception as e:
            logger.error(f"Error generating streaming answer: {e}")
            raise
    
    async def generate_with_conversation_context(
        self,
        query: str,
        context: List[SearchResult],
        conversation_history: List[ConversationMessage],
        language: str = "ar",
        temperature: float = 0.7,
        max_tokens: int = 512
    ) -> str:
        """
        توليد إجابة مع سياق المحادثة
        
        Args:
            query: الاستعلام
            context: نتائج البحث
            conversation_history: تاريخ المحادثة
            language: اللغة
            temperature: درجة الحرارة
            max_tokens: عدد التوكنات
            
        Returns:
            الإجابة المولدة
        """
        try:
            system_prompt = self._build_conversation_system_prompt(language)
            history_text = self._build_conversation_history(conversation_history, language)
            context_text = self._build_context_text(context, language)
            
            user_prompt = self._build_conversation_user_prompt(
                query, context_text, history_text, language
            )
            
            full_prompt = f"{system_prompt}\n\n{user_prompt}\n\nAssistant:"
            
            logger.info(f"Generating answer with conversation context ({len(conversation_history)} messages)")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.chat_model,
                        "prompt": full_prompt,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "top_p": 0.9,
                            "num_predict": max_tokens,
                        }
                    }
                )
                
                response.raise_for_status()
                data = response.json()
                
                answer = self._clean_answer(data["response"])
                return answer
                
        except Exception as e:
            logger.error(f"Error generating answer with context: {e}")
            raise
    
    async def generate_stream_with_conversation_context(
        self,
        query: str,
        context: List[SearchResult],
        conversation_history: List[ConversationMessage],
        language: str = "ar",
        temperature: float = 0.7,
        max_tokens: int = 512
    ) -> AsyncGenerator[str, None]:
        """توليد إجابة streaming مع سياق المحادثة"""
        try:
            system_prompt = self._build_conversation_system_prompt(language)
            history_text = self._build_conversation_history(conversation_history, language)
            context_text = self._build_context_text(context, language)
            
            user_prompt = self._build_conversation_user_prompt(
                query, context_text, history_text, language
            )
            
            full_prompt = f"{system_prompt}\n\n{user_prompt}\n\nAssistant:"
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.chat_model,
                        "prompt": full_prompt,
                        "stream": True,
                        "options": {
                            "temperature": temperature,
                            "top_p": 0.9,
                            "num_predict": max_tokens,
                        }
                    }
                ) as response:
                    response.raise_for_status()
                    
                    async for line in response.aiter_lines():
                        if line.strip():
                            try:
                                import json
                                data = json.loads(line)
                                if data.get("response"):
                                    yield data["response"]
                            except json.JSONDecodeError:
                                continue
                                
        except Exception as e:
            logger.error(f"Error generating streaming answer with context: {e}")
            raise
    
    def _build_system_prompt(self, language: str) -> str:
        """بناء system prompt"""
        if language == "ar":
            return """أنت مساعد ذكي متخصص في نظام إدارة المراسلات BDFM.Hub.
مهمتك هي مساعدة المستخدمين في البحث عن المراسلات والإجابة على أسئلتهم بناءً على السياق المقدم.

تعليمات مهمة:
1. أجب باللغة العربية بوضوح ودقة
2. استخدم المعلومات من السياق المقدم فقط
3. إذا لم تجد إجابة في السياق، قل ذلك بصراحة
4. اذكر أرقام المراسلات عند الإمكان
5. كن مهذباً ومفيداً في إجاباتك
6. قدم معلومات دقيقة ومنظمة"""
        else:
            return """You are an intelligent assistant specialized in the BDFM.Hub correspondence management system.
Your task is to help users search for correspondence and answer their questions based on the provided context.

Important instructions:
1. Answer clearly and accurately
2. Use only information from the provided context
3. If you cannot find an answer in the context, state that clearly
4. Mention correspondence numbers when possible
5. Be polite and helpful in your responses
6. Provide accurate and organized information"""
    
    def _build_conversation_system_prompt(self, language: str) -> str:
        """بناء system prompt للمحادثات"""
        if language == "ar":
            return """أنت مساعد ذكي متخصص في نظام إدارة المراسلات BDFM.Hub.
مهمتك هي مساعدة المستخدمين في البحث عن المراسلات والإجابة على أسئلتهم بناءً على السياق المقدم.

تعليمات مهمة:
1. أنت في محادثة مستمرة مع المستخدم - راعِ سياق المحادثة السابقة
2. أجب باللغة العربية بوضوح ودقة
3. استخدم المعلومات من السياق المقدم والمحادثة السابقة
4. إذا سأل المستخدم عن شيء ذكرته سابقاً، اشر إليه
5. اذكر أرقام المراسلات عند الإمكان
6. كن مهذباً ومفيداً في إجاباتك
7. قدم معلومات دقيقة ومنظمة"""
        else:
            return """You are an intelligent assistant specialized in the BDFM.Hub correspondence management system.
Your task is to help users search for correspondence and answer their questions based on the provided context.

Important instructions:
1. You are in an ongoing conversation - consider the previous conversation context
2. Answer clearly and accurately
3. Use information from both the provided context and previous conversation
4. If the user asks about something mentioned earlier, reference it
5. Mention correspondence numbers when possible
6. Be polite and helpful in your responses
7. Provide accurate and organized information"""
    
    def _build_user_prompt(self, query: str, context: List[SearchResult], language: str) -> str:
        """بناء user prompt"""
        context_text = self._build_context_text(context, language)
        
        if language == "ar":
            return f"""السياق من المراسلات ذات الصلة:

{context_text}

السؤال: {query}

الرجاء الإجابة على السؤال بناءً على السياق المقدم أعلاه. إذا كان السياق لا يحتوي على معلومات كافية، اذكر ذلك بوضوح."""
        else:
            return f"""Context from relevant correspondence:

{context_text}

Question: {query}

Please answer the question based on the context provided above. If the context does not contain enough information, state that clearly."""
    
    def _build_context_text(self, results: List[SearchResult], language: str) -> str:
        """بناء نص السياق"""
        context_parts = []
        
        for i, result in enumerate(results[:5], 1):
            if language == "ar":
                context_parts.append(f"""
المراسلة {i}:
- الرقم: {result.mail_num}
- التاريخ: {result.mail_date}
- الموضوع: {result.subject}
- المحتوى: {result.body_text}
- النوع: {result.correspondence_type}
- الأولوية: {result.priority_level}
- درجة التشابه: {(result.similarity_score * 100):.1f}%
---""")
            else:
                context_parts.append(f"""
Correspondence {i}:
- Number: {result.mail_num}
- Date: {result.mail_date}
- Subject: {result.subject}
- Content: {result.body_text}
- Type: {result.correspondence_type}
- Priority: {result.priority_level}
- Similarity: {(result.similarity_score * 100):.1f}%
---""")
        
        return '\n'.join(context_parts)
    
    def _build_conversation_history(
        self, 
        history: List[ConversationMessage], 
        language: str
    ) -> str:
        """بناء نص تاريخ المحادثة"""
        if not history:
            return "لا توجد محادثة سابقة." if language == "ar" else "No previous conversation."
        
        history_parts = []
        if language == "ar":
            history_parts.append("المحادثة السابقة:")
            for msg in history[-10:]:  # آخر 10 رسائل
                role = "المستخدم" if msg.role == "user" else "المساعد"
                history_parts.append(f"{role}: {msg.content}")
        else:
            history_parts.append("Previous conversation:")
            for msg in history[-10:]:
                role = "User" if msg.role == "user" else "Assistant"
                history_parts.append(f"{role}: {msg.content}")
        
        return '\n'.join(history_parts)
    
    def _build_conversation_user_prompt(
        self, 
        query: str, 
        context_text: str, 
        history_text: str, 
        language: str
    ) -> str:
        """بناء user prompt للمحادثات"""
        if language == "ar":
            return f"""{history_text}

السياق من المراسلات ذات الصلة:
{context_text}

السؤال الحالي: {query}

الرجاء الإجابة على السؤال مع مراعاة المحادثة السابقة والسياق المقدم."""
        else:
            return f"""{history_text}

Context from relevant correspondence:
{context_text}

Current question: {query}

Please answer considering both the previous conversation and the provided context."""
    
    def _clean_answer(self, answer: str) -> str:
        """تنظيف الإجابة"""
        # إزالة thinking tags وmetadata
        import re
        cleaned = re.sub(r'<think>.*?</think>', '', answer, flags=re.DOTALL | re.IGNORECASE)
        cleaned = re.sub(r'\[INST\].*?\[/INST\]', '', cleaned, flags=re.DOTALL | re.IGNORECASE)
        return cleaned.strip()
    
    async def check_connection(self) -> bool:
        """فحص الاتصال بـ Ollama"""
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.ollama_url}/api/tags")
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Ollama connection check failed: {e}")
            return False


# Create global LLM service instance
llm_service = LLMService()


__all__ = ["llm_service", "LLMService"]


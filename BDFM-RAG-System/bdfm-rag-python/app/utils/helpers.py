"""Helper functions for text processing and utilities"""
import re
import hashlib
from typing import List
from datetime import datetime, timedelta


def sanitize_text(text: str) -> str:
    """
    تنظيف النص من الأحرف الخاصة والمسافات الزائدة
    
    Args:
        text: النص المراد تنظيفه
        
    Returns:
        النص المنظف
    """
    if not text:
        return ""
    
    # إزالة المسافات المتعددة
    text = re.sub(r'\s+', ' ', text)
    
    # إزالة المسافات في البداية والنهاية
    text = text.strip()
    
    return text


def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50
) -> List[str]:
    """
    تقسيم النص إلى قطع (chunks) مع تداخل
    
    Args:
        text: النص المراد تقسيمه
        chunk_size: حجم كل قطعة
        chunk_overlap: مقدار التداخل بين القطع
        
    Returns:
        قائمة من القطع النصية
    """
    if not text:
        return []
    
    # تنظيف النص
    text = sanitize_text(text)
    
    # إذا كان النص أقصر من حجم القطعة، إرجاعه كما هو
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        # حساب نهاية القطعة
        end = start + chunk_size
        
        # إذا لم نصل إلى نهاية النص، حاول الإيقاف عند نقطة أو مسافة
        if end < len(text):
            # البحث عن آخر نقطة أو سطر جديد
            last_period = text.rfind('.', start, end)
            last_newline = text.rfind('\n', start, end)
            last_space = text.rfind(' ', start, end)
            
            # استخدام أفضل نقطة قطع
            if last_period != -1 and last_period > start + chunk_size // 2:
                end = last_period + 1
            elif last_newline != -1 and last_newline > start + chunk_size // 2:
                end = last_newline + 1
            elif last_space != -1 and last_space > start + chunk_size // 2:
                end = last_space + 1
        
        # إضافة القطعة
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        # الانتقال إلى البداية التالية مع التداخل
        start = end - chunk_overlap if end < len(text) else end
    
    return chunks


def generate_deterministic_id(correspondence_id: str, chunk_index: int) -> str:
    """
    توليد ID حتمي للـ embedding بناءً على correspondence_id و chunk_index
    
    Args:
        correspondence_id: معرف المراسلة
        chunk_index: رقم القطعة
        
    Returns:
        معرف حتمي
    """
    combined = f"{correspondence_id}_{chunk_index}"
    return hashlib.md5(combined.encode()).hexdigest()


def extract_highlights(text: str, query: str, context_length: int = 100) -> List[str]:
    """
    استخراج highlights من النص بناءً على الاستعلام
    
    Args:
        text: النص الكامل
        query: الاستعلام
        context_length: طول السياق حول كل match
        
    Returns:
        قائمة من highlights
    """
    if not text or not query:
        return []
    
    highlights = []
    query_words = query.lower().split()
    text_lower = text.lower()
    
    for word in query_words:
        if len(word) < 3:  # تجاهل الكلمات القصيرة جداً
            continue
            
        # البحث عن الكلمة في النص
        index = text_lower.find(word)
        while index != -1:
            # استخراج السياق
            start = max(0, index - context_length // 2)
            end = min(len(text), index + len(word) + context_length // 2)
            
            highlight = text[start:end].strip()
            if highlight and highlight not in highlights:
                # إضافة ... في البداية والنهاية إذا لزم الأمر
                if start > 0:
                    highlight = "..." + highlight
                if end < len(text):
                    highlight = highlight + "..."
                    
                highlights.append(highlight)
            
            # البحث عن التكرار التالي
            index = text_lower.find(word, index + 1)
    
    return highlights[:5]  # إرجاع أول 5 highlights فقط


def format_duration(milliseconds: int) -> str:
    """
    تنسيق المدة الزمنية
    
    Args:
        milliseconds: المدة بالميلي ثانية
        
    Returns:
        المدة مُنسقة (مثل: "2m 30s")
    """
    seconds = milliseconds / 1000
    
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        remaining_seconds = int(seconds % 60)
        return f"{minutes}m {remaining_seconds}s"
    else:
        hours = int(seconds // 3600)
        remaining_minutes = int((seconds % 3600) // 60)
        return f"{hours}h {remaining_minutes}m"


def detect_language(text: str) -> str:
    """
    كشف لغة النص (عربي أو إنجليزي) بطريقة بسيطة
    
    Args:
        text: النص المراد فحصه
        
    Returns:
        'ar' للعربية أو 'en' للإنجليزية
    """
    if not text:
        return 'ar'
    
    # عد الأحرف العربية
    arabic_chars = len(re.findall(r'[\u0600-\u06FF]', text))
    total_chars = len(re.findall(r'[a-zA-Z\u0600-\u06FF]', text))
    
    if total_chars == 0:
        return 'ar'
    
    # إذا كانت نسبة الأحرف العربية أكثر من 30%، اعتبر النص عربياً
    arabic_ratio = arabic_chars / total_chars
    return 'ar' if arabic_ratio > 0.3 else 'en'


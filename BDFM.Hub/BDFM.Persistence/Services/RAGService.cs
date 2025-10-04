using BDFM.Application.Contracts.AI;
using BDFM.Application.Models.AI;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using OllamaSharp;

namespace BDFM.Persistence.Services;

public class RAGService : IRAGService
{

    private readonly ICorrespondenceService _correspondenceService;
    private readonly IEmbeddingService _embeddingService;
    private readonly IVectorService _vectorService;
    private readonly IChatClient _chatClient;
    private readonly ILogger<RAGService> _logger;
    private readonly string _chatModel = "deepseek-r1:8b";
    private static readonly SemaphoreSlim _modelSemaphore = new SemaphoreSlim(1, 1);

    public RAGService(
        ICorrespondenceService correspondenceService,
        IEmbeddingService embeddingService,
        IVectorService vectorService,
        IChatClient chatClient,
        ILogger<RAGService> logger)
    {
        _correspondenceService = correspondenceService;
        _embeddingService = embeddingService;
        _vectorService = vectorService;
        _chatClient = chatClient;
        _logger = logger;
    }

    public async Task<bool> DeleteCorrespondenceAsync(string id)
    {
        try
        {
            // Delete embeddings first
            await _vectorService.DeleteEmbeddingsByCorrespondenceIdAsync(id);

            // Then delete correspondence
            return await _correspondenceService.DeleteCorrespondenceAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting correspondence {Id}", id);
            throw;
        }
    }

    public async Task<string> ProcessCorrespondenceAsync(CreateCorrespondenceRequest request)
    {
        try
        {
            _logger.LogInformation("Processing correspondence: {MailNum}", request.MailNum);

            // 1. Save correspondence to MongoDB
            var correspondence = await _correspondenceService.CreateCorrespondenceAsync(request);

            // 2. Generate embeddings for the correspondence
            var embeddings = await _embeddingService.GenerateEmbeddingsForCorrespondenceAsync(correspondence);

            // 3. Save embeddings to vector store
            await _vectorService.SaveEmbeddingsAsync(embeddings);

            // 4. Update correspondence with embedding reference
            correspondence.EmbeddingId = embeddings.FirstOrDefault()?.Id;
            await _correspondenceService.UpdateCorrespondenceAsync(correspondence.Id, correspondence);

            _logger.LogInformation("Successfully processed correspondence {Id} with {EmbeddingCount} embeddings",
                correspondence.Id, embeddings.Count);

            return correspondence.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing correspondence");
            throw;
        }
    }

    public async Task<string> ProcessFileDocumentAsync(CreateCorrespondenceRequest request)
    {
        try
        {
            _logger.LogInformation("Processing correspondence: {MailNum}", request.MailNum);

            // 1. Save file document to MongoDB (reusing correspondence collection for now)
            var correspondence = await _correspondenceService.CreateCorrespondenceAsync(request);

            // 2. Generate embeddings for the file document
            var embeddings = await _embeddingService.GenerateEmbeddingsForCorrespondenceAsync(correspondence);

            // 3. Save embeddings to vector store
            await _vectorService.SaveEmbeddingsAsync(embeddings);

            // 4. Update file document with embedding reference
            correspondence.EmbeddingId = embeddings.FirstOrDefault()?.Id;
            await _correspondenceService.UpdateCorrespondenceAsync(correspondence.Id, correspondence);

            _logger.LogInformation("Successfully processed file document {Id} with {EmbeddingCount} embeddings",
                correspondence.Id, embeddings.Count);

            return correspondence.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing file document");
            throw;
        }
    }

    public async Task<RAGResponse> QueryAsync(SearchRequest searchRequest)
    {
        try
        {
            _logger.LogInformation("Processing RAG query: {Query}", searchRequest.Query);

            // 1. Generate embedding for the query
            var queryEmbedding = await _embeddingService.GenerateEmbeddingAsync(searchRequest.Query);

            // 2. Search for similar documents
            var similarDocuments = await _vectorService.SearchSimilarAsync(
                queryEmbedding,
                searchRequest.MaxResults,
                searchRequest.SimilarityThreshold);

            if (!similarDocuments.Any())
            {
                return new RAGResponse
                {
                    Answer = searchRequest.Language == "ar"
                        ? "لم أجد أي مراسلات مشابهة لاستفسارك."
                        : "I couldn't find any correspondence similar to your query.",
                    Sources = new List<SearchResult>(),
                    Language = searchRequest.Language
                };
            }

            // 3. Prepare context from similar documents
            var context = PrepareContext(similarDocuments, searchRequest.Language);

            // 4. Generate response using LLM
            var answer = await GenerateAnswerAsync(searchRequest.Query, context, searchRequest.Language);

            return new RAGResponse
            {
                Answer = answer,
                Sources = similarDocuments,
                Language = searchRequest.Language
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing RAG query");
            throw;
        }
    }

    public async IAsyncEnumerable<string> QueryStreamAsync(SearchRequest searchRequest)
    {
        _logger.LogInformation("Processing streaming RAG query: {Query}", searchRequest.Query);

        // Handle the streaming logic without try-catch around yield statements
        float[] queryEmbedding;
        List<SearchResult> similarDocuments;
        bool hasError = false;
        string errorLanguage = searchRequest.Language;

        try
        {
            // 1. Generate embedding for the query
            queryEmbedding = await _embeddingService.GenerateEmbeddingAsync(searchRequest.Query);

            // 2. Search for similar documents
            similarDocuments = await _vectorService.SearchSimilarAsync(
                queryEmbedding,
                searchRequest.MaxResults,
                searchRequest.SimilarityThreshold);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during embedding generation or search");
            hasError = true;
            queryEmbedding = Array.Empty<float>();
            similarDocuments = new List<SearchResult>();
        }

        // Handle error case outside of try-catch
        if (hasError)
        {
            await foreach (var errorChunk in GetErrorResponseAsync(errorLanguage))
            {
                yield return errorChunk;
            }
            yield break;
        }

        if (!similarDocuments.Any())
        {
            yield return searchRequest.Language == "ar"
                ? "لم أجد أي مراسلات مشابهة لاستفسارك."
                : "I couldn't find any correspondence similar to your query.";
            yield break;
        }

        // 3. Prepare context from similar documents
        var context = PrepareContext(similarDocuments, searchRequest.Language);

        // 4. Generate the complete answer by collecting streaming chunks
        var answerBuilder = new System.Text.StringBuilder();
        await foreach (var chunk in GenerateAnswerStreamAsync(searchRequest.Query, context, searchRequest.Language))
        {
            answerBuilder.Append(chunk);
        }

        // 5. Clean the answer by removing unwanted tags and formatting
        var cleanAnswer = CleanLLMOutput(answerBuilder.ToString());

        // 6. Return the final response in the same format as QueryAsync
        var response = new RAGResponse
        {
            Answer = cleanAnswer,
            Sources = similarDocuments,
            Language = searchRequest.Language
        };

        yield return System.Text.Json.JsonSerializer.Serialize(response, new System.Text.Json.JsonSerializerOptions
        {
            PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase,
            WriteIndented = true,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        });
    }

    private string CleanLLMOutput(string rawOutput)
    {
        if (string.IsNullOrEmpty(rawOutput))
            return rawOutput;

        // Remove <think> tags and their content
        var cleanOutput = System.Text.RegularExpressions.Regex.Replace(
            rawOutput,
            @"<think>.*?</think>",
            "",
            System.Text.RegularExpressions.RegexOptions.Singleline | System.Text.RegularExpressions.RegexOptions.IgnoreCase
        );

        // Trim whitespace and normalize line breaks
        cleanOutput = cleanOutput.Trim();

        return cleanOutput;
    }

    private string PrepareContext(List<SearchResult> documents, string language)
    {
        var contextBuilder = new System.Text.StringBuilder();

        if (language == "ar")
        {
            contextBuilder.AppendLine("السياق من المراسلات ذات الصلة:");
            contextBuilder.AppendLine();
        }
        else
        {
            contextBuilder.AppendLine("Context from relevant correspondence:");
            contextBuilder.AppendLine();
        }

        foreach (var doc in documents.Take(5)) // Limit context to top 5 results
        {
            contextBuilder.AppendLine($"الرقم: {doc.MailNum}");
            contextBuilder.AppendLine($"التاريخ: {doc.MailDate}");
            contextBuilder.AppendLine($"الموضوع: {doc.Subject}");
            contextBuilder.AppendLine($"المحتوى: {doc.BodyText}");
            contextBuilder.AppendLine($"درجة التشابه: {doc.SimilarityScore:F2}");
            contextBuilder.AppendLine("---");
        }

        return contextBuilder.ToString();
    }

    private async Task<string> GenerateAnswerAsync(string query, string context, string language)
    {
        // Generate unique session ID for this conversation to ensure independence
        var sessionId = Guid.NewGuid().ToString("N")[..8];

        var systemPrompt = language == "ar"
            ? @"أنت مساعد ذكي متخصص في تحليل الكتب العربية. مهمتك هي الإجابة على الأسئلة بناءً على السياق المقدم من الكتب.

تعليمات مهمة:
1. هذه محادثة جديدة ومستقلة تماماً - تجاهل أي سياق سابق
2. أجب باللغة العربية بوضوح ودقة
3. إذا لم تجد إجابة في السياق، قل ذلك بصراحة
4. اذكر مصادر المعلومات من الكتب عند الإمكان
5. كن مهذباً ومفيداً في إجاباتك
6. لا تشير إلى أي محادثات أو مواضيع سابقة"
            : @"You are an intelligent assistant specialized in analyzing books. Your task is to answer questions based on the provided context from books documents.

IMPORTANT Instructions:
1. This is a completely new and independent conversation - ignore any previous context
2. Answer clearly and accurately
3. If you cannot find an answer in the context, state that clearly
4. Mention sources from books when possible
5. Be polite and helpful in your responses
6. Do not reference any previous conversations or topics";

        var userPrompt = language == "ar"
            ? $@"[جلسة جديدة - معرف: {sessionId}]

السياق:
{context}

السؤال: {query}

الرجاء الإجابة على السؤال بناءً على السياق المقدم أعلاه فقط. هذه محادثة جديدة ومستقلة."
            : $@"[New Session - ID: {sessionId}]

Context:
{context}

Question: {query}

Please answer the question based only on the context provided above. This is a new independent conversation.";

        // Use semaphore to ensure thread-safe model access and prevent context bleeding
        await _modelSemaphore.WaitAsync();
        try
        {
            // Use OllamaSharp native API for chat completion
            var ollamaClient = _chatClient as OllamaApiClient;
            if (ollamaClient == null)
            {
                throw new InvalidOperationException("Ollama client is not initialized.");
            }

            // Create isolated prompt with session boundary markers
            var fullPrompt = $"### NEW CONVERSATION SESSION {sessionId} ###\n\n{systemPrompt}\n\nUser: {userPrompt}\nAssistant:";

            var request = new OllamaSharp.Models.GenerateRequest
            {
                Model = _chatModel,
                Prompt = fullPrompt,
                Stream = true,
                // Force model to start fresh by setting context parameters
                Options = new OllamaSharp.Models.RequestOptions
                {
                    Temperature = 0.7f,
                    TopP = 0.9f,
                    RepeatPenalty = 1.1f,
                    // Reset context window to prevent bleeding from previous requests
                    NumCtx = 2048,
                    NumPredict = 512
                }
            };

            var responseStream = ollamaClient.GenerateAsync(request);
            var responseText = "";

            // Process response while maintaining session isolation
            await foreach (var chunk in responseStream)
            {
                if (chunk != null)
                {
                    responseText += chunk.Response ?? "";
                }
            }

            return string.IsNullOrEmpty(responseText)
                ? (language == "ar" ? "عذراً، لم أتمكن من إنتاج إجابة." : "Sorry, I couldn't generate an answer.")
                : responseText.Trim();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating answer with LLM for session {SessionId}", sessionId);
            return language == "ar"
                ? "حدث خطأ أثناء إنتاج الإجابة."
                : "An error occurred while generating the answer.";
        }
        finally
        {
            _modelSemaphore.Release();
        }
    }

    private async IAsyncEnumerable<string> GetErrorResponseAsync(string language)
    {
        await Task.Yield(); // Make it properly async
        yield return language == "ar"
            ? "حدث خطأ أثناء معالجة الاستعلام."
            : "An error occurred while processing the query.";
    }

    private async IAsyncEnumerable<string> GenerateAnswerStreamAsync(string query, string context, string language)
    {
        // Generate unique session ID for this conversation to ensure independence
        var sessionId = Guid.NewGuid().ToString("N")[..8];

        var systemPrompt = language == "ar"
            ? @"أنت مساعد ذكي متخصص في تحليل الكتب العربية. مهمتك هي الإجابة على الأسئلة بناءً على السياق المقدم من الكتب.

تعليمات مهمة:
1. هذه محادثة جديدة ومستقلة تماماً - تجاهل أي سياق سابق
2. أجب باللغة العربية بوضوح ودقة
3. إذا لم تجد إجابة في السياق، قل ذلك بصراحة
4. اذكر مصادر المعلومات من الكتب عند الإمكان
5. كن مهذباً ومفيداً في إجاباتك
6. لا تشير إلى أي محادثات أو مواضيع سابقة"
            : @"You are an intelligent assistant specialized in analyzing books. Your task is to answer questions based on the provided context from books documents.

IMPORTANT Instructions:
1. This is a completely new and independent conversation - ignore any previous context
2. Answer clearly and accurately
3. If you cannot find an answer in the context, state that clearly
4. Mention sources from books when possible
5. Be polite and helpful in your responses
6. Do not reference any previous conversations or topics";

        var userPrompt = language == "ar"
            ? $@"[جلسة جديدة - معرف: {sessionId}]

السياق:
{context}

السؤال: {query}

الرجاء الإجابة على السؤال بناءً على السياق المقدم أعلاه فقط. هذه محادثة جديدة ومستقلة."
            : $@"[New Session - ID: {sessionId}]

Context:
{context}

Question: {query}

Please answer the question based only on the context provided above. This is a new independent conversation.";

        // Prepare variables outside try-catch to handle errors properly
        OllamaApiClient? ollamaClient = null;
        IAsyncEnumerable<OllamaSharp.Models.GenerateResponseStream>? responseStream = null;
        bool hasError = false;
        string? errorMessage = null;

        // Use semaphore to ensure thread-safe model access and prevent context bleeding
        await _modelSemaphore.WaitAsync();

        try
        {
            ollamaClient = _chatClient as OllamaApiClient;
            if (ollamaClient == null)
            {
                hasError = true;
                errorMessage = language == "ar" ? "خطأ في تهيئة النموذج." : "Error initializing model.";
            }
            else
            {
                // Create isolated prompt with session boundary markers
                var fullPrompt = $"### NEW CONVERSATION SESSION {sessionId} ###\n\n{systemPrompt}\n\nUser: {userPrompt}\nAssistant:";

                var request = new OllamaSharp.Models.GenerateRequest
                {
                    Model = _chatModel,
                    Prompt = fullPrompt,
                    Stream = true,
                    // Force model to start fresh by setting context parameters
                    Options = new OllamaSharp.Models.RequestOptions
                    {
                        Temperature = 0.7f,
                        TopP = 0.9f,
                        RepeatPenalty = 1.1f,
                        // Reset context window to prevent bleeding from previous requests
                        NumCtx = 2048,
                        NumPredict = 512
                    }
                };

                responseStream = ollamaClient.GenerateAsync(request);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in streaming request setup for session {SessionId}", sessionId);
            hasError = true;
            errorMessage = language == "ar"
                ? "حدث خطأ أثناء إعداد الطلب."
                : "An error occurred while setting up the request.";
        }
        finally
        {
            _modelSemaphore.Release();
        }

        // Handle errors outside of try-catch to allow yield statements
        if (hasError)
        {
            yield return errorMessage ?? "Unknown error";
            yield break;
        }

        // Stream the response while maintaining session isolation
        if (responseStream != null)
        {
            await foreach (var chunk in responseStream)
            {
                if (chunk?.Response != null && !string.IsNullOrEmpty(chunk.Response))
                {
                    yield return chunk.Response;
                }
            }
        }
    }

    private async IAsyncEnumerable<string> GetModelErrorAsync(string language)
    {
        await Task.Yield();
        yield return language == "ar" ? "خطأ في تهيئة النموذج." : "Error initializing model.";
    }

    private async IAsyncEnumerable<string> GetStreamingErrorAsync(string language)
    {
        await Task.Yield();
        yield return language == "ar"
            ? "حدث خطأ أثناء إنتاج الإجابة."
            : "An error occurred while generating the answer.";
    }
}

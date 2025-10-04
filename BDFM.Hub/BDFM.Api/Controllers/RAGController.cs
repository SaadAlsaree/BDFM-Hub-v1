using BDFM.Application.Contracts.AI;
using BDFM.Application.Models.AI;

namespace BDFM.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RAGController : Base<RAGController>
    {
        private readonly IRAGService _ragService;
        public RAGController(ILogger<RAGController> logger, IRAGService rAGService) : base(logger)
        {
            _ragService = rAGService;

        }



        /// <summary>
        /// Query the RAG system with semantic search and LLM response
        /// الاستعلام من نظام RAG مع البحث الدلالي والاستجابة من نموذج اللغة
        /// </summary>
        [HttpPost("query")]
        public async Task<IActionResult> Query([FromBody] SearchRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Query))
                {
                    return BadRequest(new
                    {
                        message = request.Language == "ar"
                            ? "الاستعلام مطلوب"
                            : "Query is required"
                    });
                }


                var response = await _ragService.QueryAsync(request);

                return Ok(response);
            }
            catch (Exception)
            {

                return StatusCode(500, new
                {
                    message = request.Language == "ar"
                        ? "حدث خطأ أثناء معالجة الاستعلام"
                        : "Error processing query"
                });
            }
        }

        /// <summary>
        /// Query the RAG system with streaming response for better UX
        /// الاستعلام من نظام RAG مع استجابة متدفقة لتجربة مستخدم أفضل
        /// Returns structured response: metadata first, then streaming answer
        /// </summary>
        [HttpPost("query/stream")]
        public async IAsyncEnumerable<string> QueryStream([FromBody] SearchRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Query))
            {
                // Return error in structured format
                var errorResponse = new
                {
                    error = request.Language == "ar" ? "الاستعلام مطلوب" : "Query is required",
                    language = request.Language,
                    type = "error"
                };
                yield return System.Text.Json.JsonSerializer.Serialize(errorResponse);
                yield break;
            }

            // Stream the response and handle errors outside of try-catch
            IAsyncEnumerable<string>? responseStream = null;
            bool hasError = false;

            try
            {
                responseStream = _ragService.QueryStreamAsync(request);
            }
            catch (Exception)
            {
                hasError = true;
            }

            if (hasError)
            {
                var errorResponse = new
                {
                    error = request.Language == "ar"
                        ? "حدث خطأ أثناء معالجة الاستعلام"
                        : "Error processing query",
                    language = request.Language,
                    type = "error"
                };
                yield return System.Text.Json.JsonSerializer.Serialize(errorResponse);
                yield break;
            }

            if (responseStream != null)
            {
                await foreach (var chunk in responseStream)
                {
                    yield return chunk;
                }
            }
        }

        /// <summary>
        /// Get system health and model status
        /// الحصول على حالة النظام والنماذج
        /// </summary>
        [HttpGet("health")]
        public IActionResult GetHealth()
        {
            try
            {
                return Ok(new
                {
                    status = "healthy",
                    timestamp = DateTime.UtcNow,
                    models = new
                    {
                        llm = "deepseek-r1:8b",
                        embedding = "granite-embedding:278m"
                    },
                    message = "RAG System is running / نظام RAG يعمل بشكل طبيعي"
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    status = "unhealthy",
                    message = "System error / خطأ في النظام"
                });
            }
        }
    }
}

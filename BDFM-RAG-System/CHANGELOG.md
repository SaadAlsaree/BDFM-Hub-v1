# Changelog

All notable changes to the BDFM RAG System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-23

### Added
- Initial release of BDFM RAG System
- RAG-based query system for correspondences
- Integration with Qdrant vector database
- Integration with Ollama for embeddings and LLM
- PostgreSQL integration for BDFM.Hub database
- Full Arabic language support
- Semantic search capabilities
- Intelligent answer generation with sources
- Streaming query support
- Synchronization system (full and incremental)
- Docker and Docker Compose support
- Comprehensive API endpoints:
  - `/api/rag/query` - Query with RAG
  - `/api/rag/query/stream` - Streaming query
  - `/api/rag/search` - Search without LLM
  - `/api/rag/sync` - Synchronize data
  - `/api/rag/index` - Index single correspondence
  - `/api/rag/correspondence/:id` - Delete correspondence
  - `/api/rag/rebuild` - Rebuild index
  - `/api/rag/status` - System status
  - `/api/rag/sync/stats` - Sync statistics
  - `/api/rag/health` - Health check
- Filtering capabilities:
  - By correspondence type
  - By priority level
  - By secrecy level
  - By date range
  - By organizational unit
- Logging system with Winston
- Error handling middleware
- Configuration management with dotenv
- CLI sync script
- Comprehensive documentation:
  - User guide (Arabic)
  - API documentation
  - README with setup instructions
  - Docker deployment guide

### Technical Stack
- Node.js 20+
- TypeScript 5.7+
- Express.js 4.21+
- Qdrant (Vector Database)
- Ollama (LLM & Embeddings)
- PostgreSQL (BDFM Database)
- Docker & Docker Compose

### Dependencies
- @qdrant/js-client-rest: ^1.11.0
- axios: ^1.7.9
- cors: ^2.8.5
- dotenv: ^16.4.7
- express: ^4.21.2
- pg: ^8.13.1
- uuid: ^11.0.3
- winston: ^3.17.0
- zod: ^3.24.1

### Performance
- Query response time: < 3 seconds (typical)
- Search time: < 100ms
- Embedding generation: < 200ms per chunk
- Sync throughput: ~100 correspondences/second

### Security
- Input validation with Zod
- SQL injection protection
- CORS configuration
- Error message sanitization in production

## [1.1.0] - 2025-10-27

### Added
- **Duplicate Prevention System**: Implemented deterministic ID generation for embeddings
- **Remove Duplicates Endpoint**: New API endpoint `POST /api/rag/remove-duplicates` to clean existing duplicates
- **Helper Functions**: Added `generateDeterministicId()` and `simpleHash()` utility functions
- **Documentation**: Added comprehensive deduplication guide in Arabic (`docs/DEDUPLICATION_AR.md`)

### Changed
- **Embedding IDs**: Switched from random UUIDs to deterministic IDs based on correspondence ID and chunk index
- **Sync Process**: Modified sync service to delete old embeddings before inserting new ones
- **Single Correspondence Sync**: Updated `syncSingleCorrespondence()` to prevent duplicates

### Fixed
- **Data Duplication**: Resolved issue where repeated sync operations created duplicate embeddings in Qdrant
- **Memory Usage**: Reduced storage usage by preventing duplicate data accumulation
- **Search Results**: Eliminated duplicate results in search queries

### Technical Details
- Deterministic ID format: `{correspondenceId}-chunk-{chunkIndex}`
- Delete-then-insert pattern for all sync operations
- Automatic cleanup of old embeddings before re-indexing

## [Unreleased]

### Planned Features
- Authentication & Authorization integration with BDFM
- Rate limiting
- API key support
- Multi-language support (English)
- Advanced analytics and metrics
- Caching layer for frequently accessed data
- Batch query support
- Export functionality for search results
- Advanced filtering options
- Real-time updates via WebSocket
- User guide content indexing
- Workflow steps indexing
- Integration with BDFM notification system

### Known Issues
- None at this time

---

## Version History

- **1.0.0** (2025-01-23): Initial release

---

For more information, see the [README](README.md) and [User Guide](docs/USER_GUIDE_AR.md).

# BDFM RAG System API Documentation

## Base URL
```
http://localhost:3001/api/rag
```

## Authentication
Currently, no authentication is required. In production, implement JWT or API key authentication.

---

## Endpoints

### 1. Query with RAG

Generate an intelligent answer using RAG based on similar correspondences.

**Endpoint:** `POST /query`

**Request Body:**
```json
{
  "query": "string (required)",
  "language": "ar | en (optional, default: ar)",
  "maxResults": "number (optional, default: 10)",
  "similarityThreshold": "number (optional, default: 0.7)",
  "filters": {
    "correspondenceType": ["string"],
    "priorityLevel": ["string"],
    "secrecyLevel": ["string"],
    "dateFrom": "string (YYYY-MM-DD)",
    "dateTo": "string (YYYY-MM-DD)",
    "organizationalUnitId": "string (UUID)"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "string",
    "sources": [
      {
        "id": "string",
        "mailNum": "string",
        "mailDate": "string",
        "subject": "string",
        "bodyText": "string",
        "correspondenceType": "string",
        "secrecyLevel": "string",
        "priorityLevel": "string",
        "personalityLevel": "string",
        "similarityScore": "number",
        "highlights": ["string"]
      }
    ],
    "language": "string",
    "metadata": {
      "queryProcessingTime": "number",
      "embeddingTime": "number",
      "searchTime": "number",
      "generationTime": "number"
    }
  },
  "timestamp": "string"
}
```

---

### 2. Query with Streaming

Same as query but with streaming response.

**Endpoint:** `POST /query/stream`

**Request:** Same as Query endpoint

**Response:** Server-Sent Events (SSE)
```
data: {"type":"sources","content":[...]}

data: {"type":"answer_start","content":""}

data: {"type":"answer_chunk","content":"text chunk"}

data: {"type":"answer_chunk","content":"more text"}

data: {"type":"answer_end","content":""}
```

---

### 3. Search

Search for similar correspondences without LLM generation.

**Endpoint:** `POST /search`

**Request Body:**
```json
{
  "query": "string (required)",
  "maxResults": "number (optional, default: 10)",
  "threshold": "number (optional, default: 0.7)",
  "filters": { /* same as query filters */ }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "mailNum": "string",
      "mailDate": "string",
      "subject": "string",
      "bodyText": "string",
      "correspondenceType": "string",
      "secrecyLevel": "string",
      "priorityLevel": "string",
      "personalityLevel": "string",
      "similarityScore": "number",
      "highlights": ["string"]
    }
  ],
  "timestamp": "string"
}
```

---

### 4. Sync Correspondences

Synchronize correspondences from PostgreSQL to Qdrant.

**Endpoint:** `POST /sync`

**Request Body:**
```json
{
  "type": "full | incremental (required)",
  "batchSize": "number (optional, default: 100)",
  "fromDate": "string (YYYY-MM-DD, for incremental)",
  "toDate": "string (YYYY-MM-DD, optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "synced": "number",
    "failed": "number",
    "duration": "string",
    "errors": ["string"] // optional
  },
  "timestamp": "string"
}
```

---

### 5. Index Single Correspondence

Index a single correspondence.

**Endpoint:** `POST /index`

**Request Body:**
```json
{
  "correspondenceId": "string (UUID, required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "correspondenceId": "string",
    "indexed": "boolean"
  },
  "timestamp": "string"
}
```

---

### 6. Delete Correspondence

Delete a correspondence from the index.

**Endpoint:** `DELETE /correspondence/:correspondenceId`

**Response:**
```json
{
  "success": true,
  "data": {
    "correspondenceId": "string",
    "deleted": "boolean"
  },
  "timestamp": "string"
}
```

---

### 7. Get Status

Get system status including connection health.

**Endpoint:** `GET /status`

**Response:**
```json
{
  "success": true,
  "data": {
    "qdrant": {
      "connected": "boolean",
      "collections": {
        "bdfm_correspondences": "number",
        "bdfm_workflows": "number",
        "bdfm_user_guide": "number"
      }
    },
    "ollama": {
      "connected": "boolean",
      "models": ["string"],
      "embeddingModel": "string",
      "chatModel": "string"
    },
    "postgres": {
      "connected": "boolean"
    },
    "config": {
      "embeddingDimension": "number",
      "chunkSize": "number",
      "maxResults": "number",
      "similarityThreshold": "number"
    }
  },
  "timestamp": "string"
}
```

---

### 8. Get Sync Statistics

Get synchronization statistics.

**Endpoint:** `GET /sync/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "postgresql": {
      "total": "number"
    },
    "qdrant": {
      "total": "number"
    },
    "synced": "number",
    "pending": "number"
  },
  "timestamp": "string"
}
```

---

### 9. Rebuild Index

Rebuild the entire index (delete and re-sync all).

**Endpoint:** `POST /rebuild`

⚠️ **Warning:** This operation deletes all data and re-syncs from scratch.

**Response:**
```json
{
  "success": true,
  "data": {
    "synced": "number",
    "failed": "number",
    "duration": "string"
  },
  "timestamp": "string"
}
```

---

### 10. Health Check

Check if the service is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": "number",
    "timestamp": "string"
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "message": "string",
    "code": "string",
    "details": "any (only in development)"
  },
  "timestamp": "string"
}
```

### Common Error Codes

- `INVALID_REQUEST`: Invalid request parameters
- `QUERY_FAILED`: Query processing failed
- `SEARCH_FAILED`: Search operation failed
- `SYNC_FAILED`: Synchronization failed
- `INDEX_FAILED`: Indexing operation failed
- `DELETE_FAILED`: Delete operation failed
- `STATUS_FAILED`: Status check failed
- `STATS_FAILED`: Statistics retrieval failed
- `REBUILD_FAILED`: Rebuild operation failed
- `INTERNAL_ERROR`: Internal server error
- `NOT_FOUND`: Endpoint not found

---

## Examples

### cURL Examples

#### Query
```bash
curl -X POST http://localhost:3001/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ما هي المراسلات الخاصة بالموارد البشرية؟",
    "language": "ar",
    "maxResults": 5
  }'
```

#### Search
```bash
curl -X POST http://localhost:3001/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "توظيف",
    "maxResults": 10,
    "threshold": 0.8
  }'
```

#### Sync
```bash
curl -X POST http://localhost:3001/api/rag/sync \
  -H "Content-Type: application/json" \
  -d '{
    "type": "incremental",
    "fromDate": "2025-01-20",
    "batchSize": 50
  }'
```

#### Status
```bash
curl http://localhost:3001/api/rag/status
```

### JavaScript/Node.js Examples

```javascript
const axios = require('axios');

// Query
const query = async () => {
  const response = await axios.post('http://localhost:3001/api/rag/query', {
    query: 'ما هي المراسلات المتعلقة بالتوظيف؟',
    language: 'ar',
    maxResults: 5,
    filters: {
      priorityLevel: ['High', 'Urgent'],
      dateFrom: '2025-01-01'
    }
  });

  console.log(response.data);
};

// Search
const search = async () => {
  const response = await axios.post('http://localhost:3001/api/rag/search', {
    query: 'توظيف',
    maxResults: 10
  });

  console.log(response.data);
};

// Sync
const sync = async () => {
  const response = await axios.post('http://localhost:3001/api/rag/sync', {
    type: 'full',
    batchSize: 100
  });

  console.log(response.data);
};
```

### Python Examples

```python
import requests

# Query
def query():
    response = requests.post('http://localhost:3001/api/rag/query', json={
        'query': 'ما هي المراسلات المتعلقة بالتوظيف؟',
        'language': 'ar',
        'maxResults': 5
    })
    print(response.json())

# Search
def search():
    response = requests.post('http://localhost:3001/api/rag/search', json={
        'query': 'توظيف',
        'maxResults': 10,
        'threshold': 0.8
    })
    print(response.json())

# Sync
def sync():
    response = requests.post('http://localhost:3001/api/rag/sync', json={
        'type': 'incremental',
        'fromDate': '2025-01-20',
        'batchSize': 50
    })
    print(response.json())
```

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting based on IP address or API key.

## Versioning

Current API version: v1

The API version is included in the base URL: `/api/rag`

---

## Support

For support, please refer to the main README.md or contact the BDFM development team.

---

**Last Updated:** 2025-01-23
**Version:** 1.0.0

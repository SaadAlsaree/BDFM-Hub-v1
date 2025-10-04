export interface FileAttachmentPayload {
    id?: string;
    primaryTableId?: string;       // UUID of the parent table record
    file?: string;                 // Base64-encoded binary string or file identifier
    tableName?: number;           // Enum or code indicating the table type
    description?: string;         // File description or label
    fileSize?: number;            // Size in bytes (int64)
    ocrText?: string;             // Extracted text from OCR if applicable
    createBy: string;            // UUID of the user who uploaded
}


export interface FileAttachmentList {
    id?: string;                    // UUID of the file record
    primaryTableId?: string;        // UUID of the related parent record
    tableName?: number;            // Enum or identifier of the table type
    tableNameDisplay?: string | null; // Optional display name of the table
    description?: string;          // File description
    fileName?: string;             // Name of the uploaded file
    fileExtension?: string;        // File extension (e.g., .png, .pdf)
    fileSize?: number;             // Size in bytes
    status?: number;               // Status code (e.g., 1 = active)
    statusName?: string;           // Display name for status (e.g., "فعال")
    createAt?: string;             // ISO timestamp of creation
    createBy?: string | null;      // UUID of the user who uploaded it
    createByName?: string | null;   // Name of the user who uploaded it
}


export interface FileAttachmentDetail {
    id?: string;
    primaryTableId?: string;
    tableName?: number;
    tableNameDisplay?: string | null;
    description?: string;
    fileName?: string;
    filePath?: string;                // New: Path to file in storage
    fileExtension?: string;
    fileSize?: number;
    ocrText?: string | null;          // New: Text extracted via OCR
    statusId?: number;                // New: Status identifier
    statusName?: string;
    createAt?: string;                // ISO 8601 timestamp
    createBy?: string | null;
    lastUpdateAt?: string | null;     // New: Last update timestamp
    lastUpdateBy?: string | null;     // New: Last updated by user ID
    fileBase64?: string;              // New: Base64-encoded file content
    createByName?: string | null;      // Name of the user who uploaded it
    lastUpdateByName?: string | null;  // Name of the user who last updated it
}

export interface FileAttachmentStatus {
    id?: string;
    statusId: number;
    tableName: number;
    teamId?: string;
    teamName?: string;
}



export interface FileAttachmentQuery {
    page: number;
    pageSize: number;
    status?: number;
    tableName?: number;
    primaryTableId?: string;
    fileExtension?: string;
    fromDate?: string;
    toDate?: string;
}

export interface FileAttachmentResponse {
    items: FileAttachmentList[];
    totalCount: number;
}






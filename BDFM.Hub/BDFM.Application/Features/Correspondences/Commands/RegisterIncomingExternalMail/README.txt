إنشاء سجل لمراسلة جديدة تم استلامها من جهة خارجية. يتضمن ذلك تسجيل تفاصيلها الأساسية، مرفقاتها، ربطها بملف، وإمكانية الإشارة إلى كتب سابقة


 // 1. Determine or create a MailFile
	 // Use existing file if specified
	 // Generate a new unique FileNumber (e.g., "SEQ-YYYY-NNNN")
		// Extract sequence number and increment
	// Create new MailFile

// 2. Create a new Correspondence record

// 3. If RefersToPreviousInternalCorrespondenceId is provided, create a link

// 4. Process attachments if provided
	// Save file to storage
		// Create attachment record

	// Update Correspondence attachment info

// 5. Create an initial WorkflowStep for registration
	// Set status to "Registered"
	// Assign to the current user
	// Set due date to 3 days from now
// 6. Log the action in AuditLog
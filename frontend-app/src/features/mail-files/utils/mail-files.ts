import { z } from "zod";

// Define the MailFileStatus enum
export enum MailFileStatus {
    Active = 1,
    Inactive = 2,
    Completed = 3,
    Archived = 4,
    Deleted = 5,
}

// Status label configuration for UI display with proper variant types
export const statusLabels: Record<MailFileStatus, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
    [MailFileStatus.Active]: { label: "Active", variant: "default" },
    [MailFileStatus.Inactive]: { label: "Inactive", variant: "outline" },
    [MailFileStatus.Completed]: { label: "Completed", variant: "secondary" },
    [MailFileStatus.Archived]: { label: "Archived", variant: "secondary" },
    [MailFileStatus.Deleted]: { label: "Deleted", variant: "destructive" },
};

// Define correspondence type enum
export enum CorrespondenceType {
    Incoming = 1,
    Outgoing = 2,
    Internal = 3,
}

export const correspondenceTypeLabels: Record<CorrespondenceType, { label: string; variant: "default" | "outline" | "secondary" }> = {
    [CorrespondenceType.Incoming]: { label: "Incoming", variant: "default" },
    [CorrespondenceType.Outgoing]: { label: "Outgoing", variant: "outline" },
    [CorrespondenceType.Internal]: { label: "Internal", variant: "secondary" },
};

// Form validation schema for mail files
export const formSchema = () => {
    return z.object({
        name: z.string().min(1, "File number is required"),
        subject: z.string().min(1, "Subject is required"),
        status: z.number().int().min(1).max(5).default(MailFileStatus.Active),
    });
};

// Define the form values type based on the schema
export type MailFileFormValues = z.infer<ReturnType<typeof formSchema>>;

// Utility function to format mail file data for API calls
export const formatMailFilePayload = (formData: MailFileFormValues, id?: string) => {
    const payload = {
        ...formData,
    };

    if (id) {
        return { id, ...payload };
    }

    return payload;
};

// Helper to check if a mail file is active
export const isMailFileActive = (status: number): boolean => {
    return status === MailFileStatus.Active;
};

// Helper to get status text for display
export const getMailFileStatusText = (status: number): string => {
    return statusLabels[status as MailFileStatus]?.label || "Unknown";
};

// Helper to get correspondence type text for display
export const getCorrespondenceTypeText = (type: number): string => {
    return correspondenceTypeLabels[type as CorrespondenceType]?.label || "Unknown";
};

// Format date for display
export const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Not available";

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    } catch (error) {
        return "Invalid date";
    }
};

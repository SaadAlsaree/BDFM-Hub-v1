import { z } from "zod";
import { IOrganizationalUnitDetails, UnitType } from "../types/organizational";

// Define the OrganizationalUnitStatus enum
export enum OrganizationalUnitStatus {
    Active = 1,
    Inactive = 2,
    Deleted = 4,
}

// Status label configuration for UI display with proper variant types
export const statusLabels: Record<OrganizationalUnitStatus, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
    [OrganizationalUnitStatus.Active]: { label: "Active", variant: "default" },
    [OrganizationalUnitStatus.Inactive]: { label: "Inactive", variant: "outline" },
    [OrganizationalUnitStatus.Deleted]: { label: "Deleted", variant: "destructive" },
};

// Dynamic form schema based on whether it's an edit or create operation
export const formSchema = (initialData: IOrganizationalUnitDetails | null) => {
    return z.object({
        unitName: z.string().min(1, "Unit name is required"),
        unitCode: z.string().min(1, "Unit code is required"),
        unitDescription: z.string().optional(),
        parentUnitId: z.string().optional(),
        unitType: z.number().int().min(1).max(5).default(UnitType.DEPARTMENT),
        email: z.string().email("Invalid email format").optional(),
        phoneNumber: z.string().min(1, "Phone number is required").optional(),
        address: z.string().min(1, "Address is required").optional(),
        unitLogo: z.string().min(1, "Unit logo is required").optional(),
        unitLevel: z.number().int().min(1, "Unit level must be at least 1"),
        canReceiveExternalMail: z.boolean().optional(),
        canSendExternalMail: z.boolean().optional(),
        // Keeping status as it's important for system functionality
        status: z.number().int().min(1).max(4).default(OrganizationalUnitStatus.Active),
    });
};

// Define the form values type based on the schema
export type OrganizationalUnitFormValues = z.infer<ReturnType<typeof formSchema>>;

// Utility function to format organizational unit data for API calls
export const formatOrganizationalUnitPayload = (formData: OrganizationalUnitFormValues, id?: string) => {
    const payload = {
        ...formData,
    };

    if (id) {
        return { id, ...payload };
    }

    return payload;
};

// Helper to check if an organizational unit is active
export const isOrganizationalUnitActive = (status: number): boolean => {
    return status === OrganizationalUnitStatus.Active;
};

// Helper to get status text for display
export const getOrganizationalUnitStatusText = (status: number): string => {
    return statusLabels[status as OrganizationalUnitStatus]?.label || "Unknown";
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

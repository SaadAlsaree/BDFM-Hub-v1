import { z } from "zod";
import { UserDetailed } from "../types/user";

// Define the AuthStatus enum that was missing
export enum AuthStatus {
    Active = 1,
    Inactive = 2,
    Locked = 3,
    Deleted = 4,
    Pending = 5,
    Rejected = 6,
    Suspended = 7,
    Banned = 8,
}

// Status label configuration for UI display with proper variant types
export const statusLabels: Record<AuthStatus, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
    [AuthStatus.Active]: { label: "Active", variant: "default" },
    [AuthStatus.Inactive]: { label: "Inactive", variant: "outline" },
    [AuthStatus.Locked]: { label: "Locked", variant: "secondary" },
    [AuthStatus.Deleted]: { label: "Deleted", variant: "destructive" },
    [AuthStatus.Pending]: { label: "Pending", variant: "secondary" },
    [AuthStatus.Rejected]: { label: "Rejected", variant: "destructive" },
    [AuthStatus.Suspended]: { label: "Suspended", variant: "secondary" },
    [AuthStatus.Banned]: { label: "Banned", variant: "destructive" },
};

export const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

// Dynamic form schema based on whether it's an edit or create operation
export const formSchema = (initialData: UserDetailed | null) => {
    // Common schema fields
    const baseSchema = {
        username: z.string().min(1, "Username is required"),
        userLogin: z.string().min(1, "User login is required"),
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().email("Invalid email format"),
        organizationalUnitId: z.string().uuid("Invalid organizational unit ID"),
        positionTitle: z.string().optional(),
        rfidTagId: z.string().optional(),
        isActive: z.boolean(),
        roleIds: z.array(optionSchema).optional(),
    };

    // Add password field only for new users
    if (!initialData) {
        return z.object({
            ...baseSchema,
            password: z.string().min(8, "Password must be at least 8 characters"),
            isTwoFactorEnabled: z.boolean().optional(),
        });
    }

    // For edit mode, password is optional
    return z.object({
        ...baseSchema,
        password: z.string().optional(),
        isTwoFactorEnabled: z.boolean().optional(),
    });
};

// Password validation schema
export const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
        .string()
        .min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف")
        .regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف أو أكثر")
        .regex(/[a-z]/, "كلمة المرور يجب أن تحتوي على حرف أو أكثر")
        .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم أو أكثر"),
    confirmNewPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
});

// Reset password schema
export const resetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف")
        .regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف أو أكثر")
        .regex(/[a-z]/, "كلمة المرور يجب أن تحتوي على حرف أو أكثر")
        .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم أو أكثر"),
    confirmNewPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
});

// Define the form values type based on the schema
export type UserFormValues = z.infer<ReturnType<typeof formSchema>>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Utility function to format user data for API calls
export const formatUserPayload = (formData: UserFormValues, id?: string) => {
    const payload = {
        ...formData,
    };

    if (id) {
        return { id, ...payload };
    }

    return payload;
};

// Helper to check if a user is active
export const isUserActive = (status: number): boolean => {
    return status === AuthStatus.Active;
};

// Helper to get status text for display
export const getUserStatusText = (status: number): string => {
    return statusLabels[status as AuthStatus]?.label || "Unknown";
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

// Helper to sort roles by name
export const sortRolesByName = (roles: Array<{ name?: string }>): Array<{ name?: string }> => {
    return [...roles].sort((a, b) => {
        const nameA = a.name?.toLowerCase() || "";
        const nameB = b.name?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
    });
};
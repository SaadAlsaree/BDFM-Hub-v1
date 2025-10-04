// Adapted from shadcn/ui toast component
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import {
    useToast as useToastOriginal,
    type ToastActionProps,
} from "@/components/ui/toast";

export type ToastVariants = NonNullable<ToastProps["variant"]>;

export interface ToastOptions {
    title?: string;
    description?: string;
    variant?: ToastVariants;
    action?: ToastActionElement;
    duration?: number;
}

export function useToast() {
    const { toast } = useToastOriginal();

    return {
        toast: (options: ToastOptions = {}) => {
            const { title, description, variant, action, duration = 5000 } = options;

            return toast({
                variant,
                title,
                description,
                action,
                duration,
            });
        },
    };
}

export { ToastAction, type ToastActionProps } from "@/components/ui/toast"; 
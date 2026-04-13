import { toast } from "sonner"

type UseToastResult = {
    toast: typeof toast
    dismiss: typeof toast.dismiss
}

export function useToast(): UseToastResult {
    return {
        toast,
        dismiss: toast.dismiss,
    }
}

export { toast }

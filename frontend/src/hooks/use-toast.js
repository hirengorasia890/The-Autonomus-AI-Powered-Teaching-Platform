import { useToast as useShadcnToast } from "../components/ui/use-toast";

export function useToast() {
  const { toast } = useShadcnToast();

  const showSuccess = (message, title = "Success") => {
    toast({
      title,
      description: message,
      variant: "default",
    });
  };

  const showError = (message, title = "Error") => {
    toast({
      title,
      description: message,
      variant: "destructive",
    });
  };

  return { toast, showSuccess, showError };
}

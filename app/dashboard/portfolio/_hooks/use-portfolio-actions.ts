import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { regeneratePortfolio, togglePublish, updateTemplate } from "../../actions";

export function usePortfolioActions(hasContent: boolean, initialPublished: boolean) {
  const [isPending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handlePublishChange = useCallback((checked: boolean) => {
    if (checked && !hasContent) {
      toast.error("Generate your portfolio content first before publishing.");
      return;
    }
    setIsPublished(checked);
    startTransition(async () => {
      try {
        await togglePublish(checked);
        toast.success(checked ? "Portfolio is now live!" : "Portfolio hidden from public.");
      } catch (error) {
        setIsPublished(!checked);
        toast.error(error instanceof Error ? error.message : "Failed to update");
      }
    });
  }, [hasContent]);

  const handleTemplateChange = useCallback((value: string) => {
    startTransition(async () => {
      try {
        await updateTemplate(value);
        toast.success("Template updated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update");
      }
    });
  }, []);

  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    try {
      await regeneratePortfolio();
      toast.success("Portfolio content regenerated with AI!", {
        description: "Refresh to see the updated content preview.",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to regenerate");
    } finally {
      setIsRegenerating(false);
    }
  }, []);

  return { isPending, isPublished, isRegenerating, handlePublishChange, handleTemplateChange, handleRegenerate };
}

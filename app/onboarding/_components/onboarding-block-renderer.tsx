"use client";

import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type {
  OnboardingBlock,
  OnboardingConfirmBlock,
  OnboardingMultiInputBlock,
  OnboardingSelectorBlock,
} from "@/lib/onboarding/types";
import { trackOnboardingBlockEvent } from "@/lib/onboarding/analytics";
import { OnboardingMessageResponse } from "@/app/onboarding/_components/onboarding-chat-parts";

function OnboardingBlockWrapper({ block, children }: { block: OnboardingBlock; children: ReactNode }) {
  useEffect(() => {
    trackOnboardingBlockEvent({ blockId: block.analyticsId ?? block.id, eventType: "block_viewed" });
    return () => {
      trackOnboardingBlockEvent({ blockId: block.analyticsId ?? block.id, eventType: "block_dropoff" });
    };
  }, [block.analyticsId, block.id]);

  return (
    <div data-onboarding-block-id={block.analyticsId ?? block.id} className="space-y-2">
      {children}
    </div>
  );
}

export function renderOnboardingBlocks({ blocks, onSend }: { blocks: OnboardingBlock[]; onSend: (text: string, blockId: string) => void }) {
  const rendererMap: Record<OnboardingBlock["type"], (block: OnboardingBlock) => ReactNode> = {
    text: (block) => (
      <OnboardingBlockWrapper key={block.id} block={block}>
        <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
      </OnboardingBlockWrapper>
    ),
    text_input: (block) => (
      <OnboardingBlockWrapper key={block.id} block={block}>
        <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
      </OnboardingBlockWrapper>
    ),
    multi_input: (block) => {
      const multiInputBlock = block as OnboardingMultiInputBlock;
      return (
        <OnboardingBlockWrapper key={block.id} block={block}>
          <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
          {multiInputBlock.helperText ? <p className="text-muted-foreground text-xs">{multiInputBlock.helperText}</p> : null}
        </OnboardingBlockWrapper>
      );
    },
    selector: (block) => {
      const selectorBlock = block as OnboardingSelectorBlock;
      return (
        <OnboardingBlockWrapper key={block.id} block={block}>
          <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
          <div className="flex flex-wrap gap-2">
            {selectorBlock.options.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  trackOnboardingBlockEvent({ blockId: block.analyticsId ?? block.id, eventType: "block_completed", metadata: { optionId: option.id } });
                  onSend(option.value, block.analyticsId ?? block.id);
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </OnboardingBlockWrapper>
      );
    },
    confirm: (block) => {
      const confirmBlock = block as OnboardingConfirmBlock;
      return (
        <OnboardingBlockWrapper key={block.id} block={block}>
          <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => {
                trackOnboardingBlockEvent({ blockId: block.analyticsId ?? block.id, eventType: "block_completed", metadata: { confirmed: true } });
                onSend(confirmBlock.confirmLabel ?? "Yes, looks good!", block.analyticsId ?? block.id);
              }}
            >
              {confirmBlock.confirmLabel ?? "Yes, looks good"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                trackOnboardingBlockEvent({ blockId: block.analyticsId ?? block.id, eventType: "block_completed", metadata: { confirmed: false } });
                onSend(confirmBlock.rejectLabel ?? "No, let me change that", block.analyticsId ?? block.id);
              }}
            >
              {confirmBlock.rejectLabel ?? "No, let me change"}
            </Button>
          </div>
        </OnboardingBlockWrapper>
      );
    },
  };

  return blocks.map((block, index) => {
    const renderer = rendererMap[block.type as OnboardingBlock["type"]];
    if (!renderer) {
      const fallbackText = block.prompt || "Let's continue.";
      return (
        <OnboardingBlockWrapper key={`${block.id}-${index}`} block={{ ...block, type: "text" }}>
          <OnboardingMessageResponse>{fallbackText}</OnboardingMessageResponse>
        </OnboardingBlockWrapper>
      );
    }
    return renderer(block);
  });
}

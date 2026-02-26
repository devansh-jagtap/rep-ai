"use client";

import { useEffect, useState, type ReactNode, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  OnboardingBlock,
  OnboardingConfirmBlock,
  OnboardingMultiInputBlock,
  OnboardingSelectorBlock,
  OnboardingTagSelectorBlock,
  OnboardingCardEditorBlock,
  OnboardingAccordionEditorBlock,
  OnboardingInputWithValidationBlock,
} from "@/lib/onboarding/types";
import { trackOnboardingBlockEvent } from "@/lib/onboarding/analytics";
import { OnboardingMessageResponse } from "@/app/onboarding/_components/onboarding-chat-parts";
import {
  SetupPathSelector,
  ToneSelectorCards,
  ServicesTagSelector,
  TitleSuggestions,
  TargetAudienceChips,
  ContactPreferencesChips,
  HandleInputWithValidation,
  FAQAccordionEditor,
  ProjectsCardEditor,
  SectionSelectorCards,
} from "@/app/onboarding/_components/onboarding-generative-ui";

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

function isBlockIdMatches(blockId: string, ...patterns: string[]) {
  return patterns.some(p => blockId.toLowerCase().includes(p.toLowerCase()));
}

export function renderOnboardingBlocks({ blocks, onSend }: { blocks: OnboardingBlock[]; onSend: (text: string, blockId: string) => void }) {
  const rendererMap: Partial<Record<OnboardingBlock["type"], (block: OnboardingBlock) => ReactNode>> = {
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
      const blockId = selectorBlock.analyticsId ?? selectorBlock.id;
      
      if (isBlockIdMatches(blockId, "setup-path")) {
        return (
          <OnboardingBlockWrapper key={block.id} block={block}>
            <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
            <SetupPathSelector
              options={selectorBlock.options}
              onSelect={(value, optionId) => {
                trackOnboardingBlockEvent({ blockId, eventType: "block_completed", metadata: { optionId } });
                onSend(value, blockId);
              }}
            />
          </OnboardingBlockWrapper>
        );
      }

      if (isBlockIdMatches(blockId, "tone")) {
        return (
          <OnboardingBlockWrapper key={block.id} block={block}>
            <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
            <ToneSelectorCards
              options={selectorBlock.options}
              onSelect={(value, optionId) => {
                trackOnboardingBlockEvent({ blockId, eventType: "block_completed", metadata: { optionId } });
                onSend(value, blockId);
              }}
            />
          </OnboardingBlockWrapper>
        );
      }

      if (selectorBlock.layout === "cards") {
        return (
          <OnboardingBlockWrapper key={block.id} block={block}>
            <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
            <ToneSelectorCards
              options={selectorBlock.options}
              onSelect={(value, optionId) => {
                trackOnboardingBlockEvent({ blockId, eventType: "block_completed", metadata: { optionId } });
                onSend(value, blockId);
              }}
            />
          </OnboardingBlockWrapper>
        );
      }

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
    tag_selector: (block) => {
      const tagBlock = block as OnboardingTagSelectorBlock;
      const blockId = block.analyticsId ?? block.id;
      
      if (isBlockIdMatches(blockId, "services")) {
        return (
          <OnboardingBlockWrapper key={block.id} block={block}>
            <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
            <ServicesTagSelector
              presets={tagBlock.presets}
              onChange={() => {}}
              onSubmit={() => {}}
              max={tagBlock.max}
            />
          </OnboardingBlockWrapper>
        );
      }

      if (isBlockIdMatches(blockId, "target-audience")) {
        return (
          <OnboardingBlockWrapper key={block.id} block={block}>
            <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
            <TargetAudienceChips
              onSelect={() => {}}
            />
          </OnboardingBlockWrapper>
        );
      }

      if (isBlockIdMatches(blockId, "contact-preferences")) {
        return (
          <OnboardingBlockWrapper key={block.id} block={block}>
            <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
            <ContactPreferencesChips
              onSelect={() => {}}
            />
          </OnboardingBlockWrapper>
        );
      }

      return (
        <OnboardingBlockWrapper key={block.id} block={block}>
          <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
        </OnboardingBlockWrapper>
      );
    },
    card_editor: (block) => {
      const cardBlock = block as OnboardingCardEditorBlock;
      const blockId = block.analyticsId ?? block.id;
      
      if (isBlockIdMatches(blockId, "projects")) {
        return (
          <OnboardingBlockWrapper key={block.id} block={block}>
            <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
            <ProjectsCardEditor
              onChange={() => {}}
              onSubmit={() => {}}
              maxItems={cardBlock.maxItems}
            />
          </OnboardingBlockWrapper>
        );
      }

      return (
        <OnboardingBlockWrapper key={block.id} block={block}>
          <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
        </OnboardingBlockWrapper>
      );
    },
    accordion_editor: (block) => {
      const blockId = block.analyticsId ?? block.id;
      
      if (isBlockIdMatches(blockId, "faq")) {
        return (
          <OnboardingBlockWrapper key={block.id} block={block}>
            <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
            <FAQAccordionEditor
              onChange={() => {}}
              onSubmit={() => {}}
            />
          </OnboardingBlockWrapper>
        );
      }

      return (
        <OnboardingBlockWrapper key={block.id} block={block}>
          <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
        </OnboardingBlockWrapper>
      );
    },
    input_with_validation: (block) => {
      const validatedBlock = block as OnboardingInputWithValidationBlock;
      const blockId = block.analyticsId ?? block.id;
      
      if (validatedBlock.validationType === "handle" || isBlockIdMatches(blockId, "handle")) {
        return (
          <OnboardingBlockWrapper key={block.id} block={block}>
            <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
            <HandleInputWithValidation
              onChange={() => {}}
              onSubmit={() => {}}
            />
          </OnboardingBlockWrapper>
        );
      }

      return (
        <OnboardingBlockWrapper key={block.id} block={block}>
          <OnboardingMessageResponse>{block.prompt}</OnboardingMessageResponse>
        </OnboardingBlockWrapper>
      );
    },
  };

  return blocks.map((block, index) => {
    const renderer = rendererMap[block.type];
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

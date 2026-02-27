'use client';

import React from 'react';

import { AnimatePresence, motion } from 'motion/react';

import { useTabs, type Tab } from '@/hooks/UseTabs';
import { cn } from '@/lib/utils';

interface AnimatedTabsProps {
  tabs: Tab[];
  renderContent: (tab: Tab) => React.ReactNode;
}

const transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.15
} as const;

const TabContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transition}
      className="mt-4"
    >
      {children}
    </motion.div>
  );
};

type HighlightRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const Tabs = ({
  tabs,
  selectedTabIndex,
  setSelectedTab
}: {
  tabs: Tab[];
  selectedTabIndex: number;
  setSelectedTab: (input: [number, number]) => void;
}) => {
  const navRef = React.useRef<HTMLDivElement>(null);
  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const [hoveredTabIndex, setHoveredTabIndex] = React.useState<number | null>(null);
  const [hoverRect, setHoverRect] = React.useState<HighlightRect | null>(null);
  const [selectedRect, setSelectedRect] = React.useState<HighlightRect | null>(null);

  const updateRects = React.useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const navBounds = nav.getBoundingClientRect();

    const currentSelected = buttonRefs.current[selectedTabIndex];
    if (currentSelected) {
      const rect = currentSelected.getBoundingClientRect();
      setSelectedRect({
        x: rect.left - navBounds.left - 9,
        y: rect.top - navBounds.top - 4,
        width: rect.width + 18,
        height: rect.height + 10
      });
    } else {
      setSelectedRect(null);
    }

    if (hoveredTabIndex === null) {
      setHoverRect(null);
      return;
    }

    const currentHover = buttonRefs.current[hoveredTabIndex];
    if (currentHover) {
      const rect = currentHover.getBoundingClientRect();
      setHoverRect({
        x: rect.left - navBounds.left - 10,
        y: rect.top - navBounds.top - 4,
        width: rect.width + 20,
        height: rect.height + 10
      });
    } else {
      setHoverRect(null);
    }
  }, [hoveredTabIndex, selectedTabIndex]);

  React.useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, tabs.length);
    updateRects();
  }, [tabs.length, updateRects]);

  React.useEffect(() => {
    updateRects();
    window.addEventListener('resize', updateRects);
    return () => window.removeEventListener('resize', updateRects);
  }, [updateRects]);

  const dangerIndex = tabs.findIndex(({ value }) => value === 'danger-zone');

  return (
    <nav
      ref={navRef}
      className="flex flex-shrink-0 justify-center items-center relative z-0 py-2"
      onPointerLeave={() => setHoveredTabIndex(null)}
    >
      {tabs.map((item, i) => {
        const isActive = selectedTabIndex === i;

        return (
          <button
            key={item.value}
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            className="text-sm relative rounded-md flex items-center h-8 px-4 z-20 bg-transparent cursor-pointer select-none transition-colors"
            onPointerEnter={() => setHoveredTabIndex(i)}
            onFocus={() => setHoveredTabIndex(i)}
            onClick={() => setSelectedTab([i, i > selectedTabIndex ? 1 : -1])}
          >
            <motion.span
              className={cn('block', {
                'text-zinc-500': !isActive,
                'text-black dark:text-white font-semibold': isActive
              })}
            >
              <small className={item.value === 'danger-zone' ? 'text-red-500' : 'text-md'}>
                {item.label}
              </small>
            </motion.span>
          </button>
        );
      })}

      <AnimatePresence>
        {hoverRect && (
          <motion.div
            key="hover"
            className={`absolute z-10 top-0 left-0 rounded-md ${
              hoveredTabIndex === dangerIndex
                ? 'bg-red-100 dark:bg-red-500/30'
                : 'bg-zinc-100 dark:bg-zinc-800'
            }`}
            initial={{ ...hoverRect, opacity: 0 }}
            animate={{ ...hoverRect, opacity: 1 }}
            exit={{ ...hoverRect, opacity: 0 }}
            transition={transition}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRect && (
          <motion.div
            className={`absolute z-10 bottom-0 left-0 h-[2px] ${
              selectedTabIndex === dangerIndex ? 'bg-red-500' : 'bg-black dark:bg-white'
            }`}
            initial={false}
            animate={{
              width: selectedRect.width,
              x: selectedRect.x,
              opacity: 1
            }}
            transition={transition}
          />
        )}
      </AnimatePresence>
    </nav>
  );
};

export function AnimatedTabs({ tabs, renderContent }: AnimatedTabsProps) {
  const [hookProps] = React.useState(() => {
    const initialTabId =
      tabs.find((tab) => tab.value === 'home')?.value || tabs[0].value;

    return {
      tabs: tabs.map(({ label, value, subRoutes }) => ({
        label,
        value,
        subRoutes
      })),
      initialTabId
    };
  });

  const framer = useTabs(hookProps);

  return (
    <div className="w-full">
      <div className="relative flex w-full items-center justify-between border-b dark:border-dark-4 overflow-x-auto overflow-y-hidden">
        <Tabs {...framer.tabProps} />
      </div>
      <AnimatePresence mode="wait">
        <TabContent key={framer.selectedTab.value}>{renderContent(framer.selectedTab)}</TabContent>
      </AnimatePresence>
    </div>
  );
}

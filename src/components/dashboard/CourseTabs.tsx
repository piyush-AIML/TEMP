'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Tab shell for the professor course page (Stage 2). All panel content is
 * server-rendered once and passed in as children — the client only switches
 * visibility, so server-only modules never leak into client code. Stage 3
 * adds the Planner tab by passing one more panel.
 */

export function CourseTabs({
  tabs,
}: {
  tabs: Array<{ id: string; label: string; panel: React.ReactNode }>;
}) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '');
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div>
      <div
        role='tablist'
        aria-label='Course sections'
        className='flex gap-1.5 overflow-x-auto border-b border-ec-sky dark:border-ec-canvas-deep'
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role='tab'
            id={`course-tab-${tab.id}`}
            aria-selected={active?.id === tab.id}
            aria-controls='course-tabpanel'
            onClick={() => setActiveId(tab.id)}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-150',
              active?.id === tab.id
                ? 'border-ec-indigo text-ec-indigo dark:border-white dark:text-white'
                : 'border-transparent text-foreground/55 hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active && (
        <div id='course-tabpanel' role='tabpanel' aria-labelledby={`course-tab-${active.id}`} className='mt-6'>
          {active.panel}
        </div>
      )}
    </div>
  );
}

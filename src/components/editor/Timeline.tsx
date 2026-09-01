'use client';

import { Plus, Trash2, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TimelineMilestone, TemplateStyles } from '@/types';
import { generateId } from '@/lib/utils';

interface TimelineProps {
  milestones: TimelineMilestone[];
  onChange: (milestones: TimelineMilestone[]) => void;
  editable?: boolean;
  styles?: TemplateStyles;
}

const DEFAULT_STYLES: TemplateStyles = {
  fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
  colors: { primary: '#09090b', secondary: '#f4f4f5', accent: '#d4ff00', background: '#ffffff', text: '#09090b' },
  logoPosition: 'left', header: '', footer: '',
  coverLayout: 'standard', sectionStyle: 'cards', borderStyle: 'rounded', accentStyle: 'glow', pricingStyle: 'standard', timelineStyle: 'vertical',
};

export function Timeline({ milestones = [], onChange, editable = true, styles = DEFAULT_STYLES }: TimelineProps) {
  const currentMilestones = Array.isArray(milestones) ? milestones : [];
  const borderClass = styles.borderStyle === 'sharp' ? 'rounded-none' : styles.borderStyle === 'pill' ? 'rounded-xl' : 'rounded-2xl';

  const updateMilestone = (id: string, field: keyof TimelineMilestone, value: string | boolean) => {
    onChange(currentMilestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const addMilestone = () => {
    onChange([...currentMilestones, { id: generateId(), title: 'Phase Milestone', description: 'Key deliverables for this phase', date: '', completed: false }]);
  };

  const removeMilestone = (id: string) => {
    onChange(currentMilestones.filter((m) => m.id !== id));
  };

  return (
    <div className={`${borderClass} border p-5 shadow-xs`} style={{ backgroundColor: styles.sectionStyle === 'filled' ? styles.colors.secondary : 'white', borderColor: `${styles.colors.text}10`, fontFamily: styles.fonts.body }}>
      <div className="relative pl-6 space-y-6" style={{ position: 'relative' }}>
        <div className="absolute left-2.5 top-2 bottom-2 w-0.5" style={{ backgroundColor: `${styles.colors.text}15` }} />
        {currentMilestones.length === 0 ? (
          <p className="text-xs italic py-2" style={{ color: `${styles.colors.text}40` }}>No milestones added yet. Add project phases below.</p>
        ) : (
          currentMilestones.map((milestone, idx) => (
            <div key={milestone.id} className="relative group">
              <div
                onClick={() => editable && updateMilestone(milestone.id, 'completed', !milestone.completed)}
                className={`absolute -left-6 top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${editable ? 'cursor-pointer' : ''}`}
                style={{
                  backgroundColor: milestone.completed ? styles.colors.primary : 'white',
                  borderColor: milestone.completed ? styles.colors.primary : `${styles.colors.text}20`,
                  color: milestone.completed ? styles.colors.accent : `${styles.colors.text}50`,
                }}
              >
                {milestone.completed ? <Check className="h-3 w-3 stroke-[3]" /> : <span className="text-[9px] font-bold">{idx + 1}</span>}
              </div>
              <div className="p-3.5 rounded-xl border space-y-2" style={{ borderColor: `${styles.colors.text}10`, backgroundColor: styles.colors.background }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {editable ? (
                      <input type="text" value={milestone.title} onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)} placeholder="Phase Title" className="w-full text-xs font-bold bg-transparent outline-none border-b border-transparent focus:border-current" style={{ color: styles.colors.text }} />
                    ) : (
                      <h4 className="text-xs font-bold" style={{ color: styles.colors.text, fontFamily: styles.fonts.heading }}>{milestone.title}</h4>
                    )}
                  </div>
                  {editable && (
                    <button onClick={() => removeMilestone(milestone.id)} className="transition-colors p-1" style={{ color: `${styles.colors.text}30` }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {editable ? (
                  <textarea value={milestone.description || ''} onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)} placeholder="Deliverable details and scope..." className="w-full text-xs bg-transparent outline-none resize-none min-h-[44px]" style={{ color: `${styles.colors.text}70` }} />
                ) : (
                  milestone.description && <p className="text-xs leading-relaxed" style={{ color: `${styles.colors.text}70` }}>{milestone.description}</p>
                )}
                <div className="flex items-center gap-2 pt-1" style={{ borderTop: `1px solid ${styles.colors.text}08` }}>
                  <Calendar className="h-3.5 w-3.5" style={{ color: `${styles.colors.text}40` }} />
                  {editable ? (
                    <input type="date" value={milestone.date || ''} onChange={(e) => updateMilestone(milestone.id, 'date', e.target.value)} className="text-[11px] bg-white border rounded-md px-2 py-0.5" style={{ color: `${styles.colors.text}70`, borderColor: `${styles.colors.text}15` }} />
                  ) : (
                    milestone.date && (
                      <span className="text-[11px] font-medium" style={{ color: `${styles.colors.text}50` }}>
                        {new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {editable && (
        <Button variant="outline" size="sm" onClick={addMilestone} className="font-semibold text-xs gap-1 mt-4">
          <Plus className="h-3.5 w-3.5" /> Add Phase Milestone
        </Button>
      )}
    </div>
  );
}

'use client';

import { Plus, Trash2, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TimelineMilestone } from '@/types';
import { generateId } from '@/lib/utils';

interface TimelineProps {
  milestones: TimelineMilestone[];
  onChange: (milestones: TimelineMilestone[]) => void;
  editable?: boolean;
}

export function Timeline({ milestones = [], onChange, editable = true }: TimelineProps) {
  const currentMilestones = Array.isArray(milestones) ? milestones : [];

  const updateMilestone = (id: string, field: keyof TimelineMilestone, value: string | boolean) => {
    onChange(currentMilestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const addMilestone = () => {
    onChange([
      ...currentMilestones,
      {
        id: generateId(),
        title: 'Phase Milestone',
        description: 'Key deliverables for this phase',
        date: '',
        completed: false,
      },
    ]);
  };

  const removeMilestone = (id: string) => {
    onChange(currentMilestones.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-xs">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e4e4e7]">
        {currentMilestones.length === 0 ? (
          <p className="text-xs text-[#a1a1aa] italic py-2">No milestones added yet. Add project phases below.</p>
        ) : (
          currentMilestones.map((milestone, idx) => (
            <div key={milestone.id} className="relative group">
              {/* Dot */}
              <div
                onClick={() => editable && updateMilestone(milestone.id, 'completed', !milestone.completed)}
                className={`absolute -left-6 top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  milestone.completed
                    ? 'bg-[#09090b] border-[#09090b] text-[#d4ff00]'
                    : 'bg-white border-[#d4d4d8] text-[#71717a] hover:border-[#09090b]'
                } ${editable ? 'cursor-pointer' : ''}`}
              >
                {milestone.completed ? <Check className="h-3 w-3 stroke-[3]" /> : <span className="text-[9px] font-bold">{idx + 1}</span>}
              </div>

              {/* Milestone Card */}
              <div className="p-3.5 rounded-xl border border-[#e4e4e7] bg-[#fcfcfd] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {editable ? (
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                        placeholder="Phase Title"
                        className="w-full text-xs font-bold text-[#09090b] bg-transparent outline-none border-b border-transparent focus:border-[#09090b]"
                      />
                    ) : (
                      <h4 className="text-xs font-bold text-[#09090b]">{milestone.title}</h4>
                    )}
                  </div>
                  {editable && (
                    <button
                      onClick={() => removeMilestone(milestone.id)}
                      className="text-[#a1a1aa] hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {editable ? (
                  <textarea
                    value={milestone.description || ''}
                    onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                    placeholder="Deliverable details and scope..."
                    className="w-full text-xs text-[#52525b] bg-transparent outline-none resize-none min-h-[44px]"
                  />
                ) : (
                  milestone.description && <p className="text-xs text-[#52525b] leading-relaxed">{milestone.description}</p>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-[#f4f4f5]">
                  <Calendar className="h-3.5 w-3.5 text-[#a1a1aa]" />
                  {editable ? (
                    <input
                      type="date"
                      value={milestone.date || ''}
                      onChange={(e) => updateMilestone(milestone.id, 'date', e.target.value)}
                      className="text-[11px] text-[#52525b] bg-white border border-[#e4e4e7] rounded-md px-2 py-0.5"
                    />
                  ) : (
                    milestone.date && (
                      <span className="text-[11px] text-[#71717a] font-medium">
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
        <Button variant="outline" size="sm" onClick={addMilestone} className="font-semibold text-xs gap-1">
          <Plus className="h-3.5 w-3.5" />
          Add Phase Milestone
        </Button>
      )}
    </div>
  );
}
'use client';

import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { TimelineMilestone } from '@/types';
import { generateId } from '@/lib/utils';

interface TimelineProps {
  milestones: TimelineMilestone[];
  onChange: (milestones: TimelineMilestone[]) => void;
  editable?: boolean;
}

export function Timeline({ milestones, onChange, editable = true }: TimelineProps) {
  const updateMilestone = (id: string, field: keyof TimelineMilestone, value: string | boolean) => {
    onChange(milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const addMilestone = () => {
    onChange([
      ...milestones,
      {
        id: generateId(),
        title: '',
        description: '',
        date: '',
        completed: false,
      },
    ]);
  };

  const removeMilestone = (id: string) => {
    onChange(milestones.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="relative flex gap-4 pb-6">
            {/* Timeline dot */}
            <div className="relative z-10 flex-shrink-0">
              <button
                onClick={() => editable && updateMilestone(milestone.id, 'completed', !milestone.completed)}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                  ${milestone.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400 hover:border-primary'
                  }
                  ${editable ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {milestone.completed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  {editable ? (
                    <Input
                      value={milestone.title}
                      onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                      placeholder="Milestone title"
                      className="font-medium border-0 px-0 focus-visible:ring-0 h-8"
                    />
                  ) : (
                    <h4 className="font-medium text-gray-900">{milestone.title || 'Untitled Milestone'}</h4>
                  )}

                  {editable ? (
                    <Textarea
                      value={milestone.description}
                      onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      className="border-0 px-0 focus-visible:ring-0 min-h-[60px] resize-none text-sm"
                    />
                  ) : milestone.description ? (
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                  ) : null}

                  <div className="flex items-center gap-2">
                    {editable ? (
                      <Input
                        type="date"
                        value={milestone.date}
                        onChange={(e) => updateMilestone(milestone.id, 'date', e.target.value)}
                        className="w-40 h-8 text-sm"
                      />
                    ) : milestone.date ? (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {new Date(milestone.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    ) : null}
                  </div>
                </div>

                {editable && (
                  <button
                    onClick={() => removeMilestone(milestone.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editable && (
        <Button variant="outline" size="sm" onClick={addMilestone}>
          <Plus className="h-4 w-4 mr-1" />
          Add Milestone
        </Button>
      )}

      {milestones.length === 0 && !editable && (
        <p className="text-gray-500 text-center py-4">No milestones defined</p>
      )}
    </div>
  );
}
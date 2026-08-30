'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  FileText,
  Users,
  Target,
  Layout,
  CheckSquare,
  Calendar,
  DollarSign,
  Scale,
  CreditCard,
  Briefcase,
  Star,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProposalSection, SectionType } from '@/types';
import { generateId, cn } from '@/lib/utils';

export const SECTION_TYPE_DETAILS: { type: SectionType; label: string; icon: any; description: string }[] = [
  { type: 'cover', label: 'Cover Page', icon: Layout, description: 'Header & Title' },
  { type: 'introduction', label: 'Introduction', icon: FileText, description: 'Executive summary' },
  { type: 'about_me', label: 'About Us / Creator', icon: Users, description: 'Credentials & bio' },
  { type: 'requirements', label: 'Client Needs', icon: Target, description: 'Requirements scope' },
  { type: 'overview', label: 'Project Overview', icon: FileText, description: 'Objectives & approach' },
  { type: 'scope', label: 'Scope of Work', icon: Briefcase, description: 'Key services' },
  { type: 'features', label: 'Features & Specs', icon: CheckSquare, description: 'Technical specs' },
  { type: 'deliverables', label: 'Deliverables', icon: CheckSquare, description: 'Tangible outputs' },
  { type: 'timeline', label: 'Project Timeline', icon: Calendar, description: 'Milestones & dates' },
  { type: 'pricing', label: 'Investment & Pricing', icon: DollarSign, description: 'Pricing calculator' },
  { type: 'terms', label: 'Terms & Conditions', icon: Scale, description: 'Legal & IP terms' },
  { type: 'payment_terms', label: 'Payment Terms', icon: CreditCard, description: 'Deposit & schedule' },
  { type: 'testimonials', label: 'Testimonials', icon: Star, description: 'Social proof' },
  { type: 'conclusion', label: 'Closing & Next Steps', icon: MessageSquare, description: 'Call to action' },
  { type: 'contact', label: 'Contact Details', icon: Phone, description: 'Get in touch' },
];

interface SortableSectionProps {
  section: ProposalSection;
  index: number;
  totalSections: number;
  isActive: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function SortableSectionItem({
  section,
  index,
  totalSections,
  isActive,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 'auto',
  };

  const typeInfo = SECTION_TYPE_DETAILS.find((t) => t.type === section.type);
  const Icon = typeInfo?.icon || FileText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        'group flex items-center gap-2 p-2.5 rounded-xl border text-xs transition-all cursor-pointer select-none',
        isDragging && 'shadow-lg opacity-85 border-[#09090b]',
        isActive
          ? 'border-[#09090b] bg-[#09090b] text-white shadow-xs font-semibold'
          : 'border-[#e4e4e7] bg-white text-[#09090b] hover:border-[#d4d4d8] hover:bg-[#fafafa]'
      )}
    >
      <button
        className={cn(
          'cursor-grab active:cursor-grabbing p-1 rounded transition-colors touch-none',
          isActive ? 'text-neutral-400 hover:text-white' : 'text-[#a1a1aa] hover:text-[#09090b]'
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className={cn(
            'h-6 w-6 rounded-lg flex items-center justify-center shrink-0',
            isActive ? 'bg-white/15 text-[#d4ff00]' : 'bg-[#f4f4f5] text-[#09090b]'
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate leading-tight">{section.title || typeInfo?.label}</p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={index === 0}
          className={cn('p-1 rounded hover:bg-black/10 disabled:opacity-20 cursor-pointer', isActive && 'hover:bg-white/20')}
          title="Move up"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={index === totalSections - 1}
          className={cn('p-1 rounded hover:bg-black/10 disabled:opacity-20 cursor-pointer', isActive && 'hover:bg-white/20')}
          title="Move down"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className={cn('p-1 rounded hover:bg-black/10 text-indigo-400 cursor-pointer', isActive && 'hover:bg-white/20')}
          title="Duplicate section"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className={cn('p-1 rounded hover:bg-black/10 text-rose-400 cursor-pointer', isActive && 'hover:bg-white/20')}
          title="Delete section"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

interface SectionManagerProps {
  sections: ProposalSection[];
  onChange: (sections: ProposalSection[]) => void;
  activeSectionId?: string;
  onSelectSection?: (id: string) => void;
}

export function SectionManager({ sections, onChange, activeSectionId, onSelectSection }: SectionManagerProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
    onChange(reordered);
  };

  const addSection = (type: SectionType) => {
    const typeInfo = SECTION_TYPE_DETAILS.find((t) => t.type === type);
    const newSection: ProposalSection = {
      id: generateId(),
      type,
      title: typeInfo?.label || 'New Section',
      content:
        type === 'pricing'
          ? { rows: [], subtotal: 0, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 0, currency: 'USD' }
          : type === 'timeline'
          ? []
          : type === 'cover'
          ? { title: 'Proposal Title', subtitle: 'Prepared for Client' }
          : '',
      order: sections.length,
    };
    onChange([...sections, newSection]);
    setShowAddMenu(false);
    onSelectSection?.(newSection.id);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const reordered = [...sections];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    onChange(reordered.map((s, i) => ({ ...s, order: i })));
  };

  const duplicateSection = (index: number) => {
    const section = sections[index];
    const newSection: ProposalSection = {
      ...section,
      id: generateId(),
      title: `${section.title} (Copy)`,
      order: index + 1,
    };
    const updated = [...sections];
    updated.splice(index + 1, 0, newSection);
    onChange(updated.map((s, i) => ({ ...s, order: i })));
  };

  const deleteSection = (index: number) => {
    if (!confirm('Are you sure you want to remove this section?')) return;
    const updated = sections.filter((_, i) => i !== index);
    onChange(updated.map((s, i) => ({ ...s, order: i })));
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {sections.map((section, index) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                index={index}
                totalSections={sections.length}
                isActive={section.id === activeSectionId}
                onSelect={() => onSelectSection?.(section.id)}
                onMoveUp={() => moveSection(index, 'up')}
                onMoveDown={() => moveSection(index, 'down')}
                onDuplicate={() => duplicateSection(index)}
                onDelete={() => deleteSection(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Section Button & Popover */}
      <div className="relative pt-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full font-bold text-xs border-dashed gap-1.5"
          onClick={() => setShowAddMenu(!showAddMenu)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Section Block
        </Button>

        {showAddMenu && (
          <div className="absolute left-0 right-0 z-30 mt-2 bg-white border border-[#e4e4e7] rounded-2xl shadow-xl max-h-80 overflow-y-auto p-1.5 animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="px-3 py-1.5 border-b border-[#f4f4f5] mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717a]">Choose Block Type</span>
            </div>
            {SECTION_TYPE_DETAILS.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.type}
                  onClick={() => addSection(type.type)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-[#09090b] text-[#d4ff00] shrink-0">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#09090b]">{type.label}</p>
                    <p className="text-[11px] text-[#71717a] truncate">{type.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
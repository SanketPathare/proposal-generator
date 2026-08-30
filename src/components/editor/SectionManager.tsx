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
  Image,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProposalSection, SectionType } from '@/types';
import { generateId, cn } from '@/lib/utils';

const sectionTypes: { type: SectionType; label: string; icon: any; description: string }[] = [
  { type: 'cover', label: 'Cover Page', icon: Layout, description: 'Title & intro' },
  { type: 'introduction', label: 'Introduction', icon: FileText, description: 'Opening section' },
  { type: 'about_me', label: 'About Me', icon: Users, description: 'Your background' },
  { type: 'requirements', label: 'Requirements', icon: Target, description: 'Client needs' },
  { type: 'overview', label: 'Project Overview', icon: FileText, description: 'Project summary' },
  { type: 'scope', label: 'Scope of Work', icon: Briefcase, description: 'Work details' },
  { type: 'features', label: 'Features', icon: CheckSquare, description: 'Feature list' },
  { type: 'deliverables', label: 'Deliverables', icon: CheckSquare, description: 'What you deliver' },
  { type: 'timeline', label: 'Timeline', icon: Calendar, description: 'Project schedule' },
  { type: 'pricing', label: 'Pricing', icon: DollarSign, description: 'Cost breakdown' },
  { type: 'terms', label: 'Terms & Conditions', icon: Scale, description: 'Legal terms' },
  { type: 'payment_terms', label: 'Payment Terms', icon: CreditCard, description: 'Payment info' },
  { type: 'portfolio', label: 'Portfolio', icon: Image, description: 'Past work' },
  { type: 'testimonials', label: 'Testimonials', icon: Star, description: 'Client reviews' },
  { type: 'conclusion', label: 'Conclusion', icon: MessageSquare, description: 'Closing section' },
  { type: 'contact', label: 'Contact', icon: Phone, description: 'Contact info' },
  { type: 'paragraph', label: 'Paragraph', icon: FileText, description: 'Custom text' },
  { type: 'heading', label: 'Heading', icon: FileText, description: 'Section heading' },
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

function SortableSection({
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
    zIndex: isDragging ? 10 : 'auto',
  };

  const typeInfo = sectionTypes.find((t) => t.type === section.type);
  const Icon = typeInfo?.icon || FileText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg border transition-all',
        isDragging ? 'shadow-lg opacity-80' : '',
        isActive
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
      onClick={onSelect}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="h-6 w-6 rounded flex items-center justify-center bg-gray-100 flex-shrink-0">
          <Icon className="h-3.5 w-3.5 text-gray-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{section.title || typeInfo?.label}</p>
          <p className="text-xs text-gray-500">{typeInfo?.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={index === 0}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={index === totalSections - 1}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="p-1 text-gray-400 hover:text-blue-600"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 text-gray-400 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
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
    const typeInfo = sectionTypes.find((t) => t.type === type);
    const newSection: ProposalSection = {
      id: generateId(),
      type,
      title: typeInfo?.label || 'New Section',
      content: type === 'pricing' ? { rows: [], subtotal: 0, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 0, currency: 'INR' }
        : type === 'timeline' ? []
        : type === 'cover' ? { title: '', subtitle: '' }
        : '',
      order: sections.length,
    };
    onChange([...sections, newSection]);
    setShowAddMenu(false);
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
    if (!confirm('Delete this section?')) return;
    const updated = sections.filter((_, i) => i !== index);
    onChange(updated.map((s, i) => ({ ...s, order: i })));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Sections ({sections.length})</h3>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {sections.map((section, index) => (
              <SortableSection
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

      {/* Add Section */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowAddMenu(!showAddMenu)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Section
        </Button>

        {showAddMenu && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {sectionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.type}
                  onClick={() => addSection(type.type)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded flex items-center justify-center bg-gray-100">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
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
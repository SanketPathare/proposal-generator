'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Highlighter,
  Undo2,
  Redo2,
  Palette,
} from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProposalEditorProps {
  content: any;
  onChange: (content: any) => void;
  placeholder?: string;
  editable?: boolean;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />;
}

function ColorPicker({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
}) {
  const colors = [
    '#000000', '#434343', '#666666', '#999999',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4',
  ];

  return (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
      <div className="grid grid-cols-4 gap-1">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => {
              onChange(color);
              onClose();
            }}
            className={cn(
              'w-6 h-6 rounded-md border transition-transform hover:scale-110',
              value === color ? 'ring-2 ring-primary ring-offset-1' : 'border-gray-200'
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}

function LinkDialog({
  editor,
  onClose,
}: {
  editor: any;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(editor.getAttributes('link').href || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url, target: '_blank' })
        .run();
    }
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 w-72">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          autoFocus
        />
        <button
          type="submit"
          className="px-3 py-1 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
        >
          Save
        </button>
      </form>
      {editor.getAttributes('link').href && (
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            onClose();
          }}
          className="mt-2 text-xs text-red-600 hover:text-red-700"
        >
          Remove link
        </button>
      )}
    </div>
  );
}

function ImageDialog({
  editor,
  onClose,
}: {
  editor: any;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 w-72">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Image URL"
          className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          autoFocus
        />
        <button
          type="submit"
          className="px-3 py-1 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
}

export function ProposalEditor({
  content,
  onChange,
  placeholder = 'Start writing your proposal...',
  editable = true,
}: ProposalEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-gray max-w-none min-h-[300px] px-4 py-3',
          'focus:outline-none',
          !editable && 'pointer-events-none opacity-75'
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-lg bg-white min-h-[400px] flex items-center justify-center text-gray-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {editable && (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50/50">
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Task List"
          >
            <ListChecks className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Link */}
          <div className="relative">
            <ToolbarButton
              onClick={() => {
                if (editor.isActive('link')) {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                } else {
                  setShowLinkDialog(true);
                }
              }}
              isActive={editor.isActive('link')}
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            {showLinkDialog && (
              <LinkDialog editor={editor} onClose={() => setShowLinkDialog(false)} />
            )}
          </div>

          {/* Image */}
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowImageDialog(true)}
              title="Insert Image"
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
            {showImageDialog && (
              <ImageDialog editor={editor} onClose={() => setShowImageDialog(false)} />
            )}
          </div>

          <ToolbarDivider />

          {/* Text Color */}
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowTextColorPicker(!showTextColorPicker)}
              title="Text Color"
            >
              <Palette className="h-4 w-4" />
            </ToolbarButton>
            {showTextColorPicker && (
              <ColorPicker
                value={editor.getAttributes('textStyle').color || '#000000'}
                onChange={(color) => editor.chain().focus().setColor(color).run()}
                onClose={() => setShowTextColorPicker(false)}
              />
            )}
          </div>

          {/* Highlight */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

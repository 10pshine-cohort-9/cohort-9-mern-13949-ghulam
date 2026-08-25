import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle, Color, FontFamily, FontSize } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import '../styles/richTextEditor.css';

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Blue', value: '#bfdbfe' },
  { label: 'Pink', value: '#fbcfe8' }
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map((size) => ({
  label: String(size),
  value: `${size}px`
}));

const FONT_FAMILIES = [
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Manrope', value: 'Manrope, sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { label: 'Impact', value: 'Impact, Charcoal, sans-serif' }
];

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Superscript,
      Subscript,
      Placeholder.configure({ placeholder: placeholder || '' })
    ],
    content: value,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML())
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    // eslint-disable-next-line no-alert
    const url = window.prompt('Enter a URL', previousUrl);
    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const textColor = editor.getAttributes('textStyle').color || '#191c1e';
  // TextAlign only sets an explicit attribute once you pick a non-default alignment,
  // so "left" (the default) needs to be inferred as active when nothing else is.
  const isLeftAligned =
    editor.isActive({ textAlign: 'left' }) ||
    (!editor.isActive({ textAlign: 'center' }) &&
      !editor.isActive({ textAlign: 'right' }) &&
      !editor.isActive({ textAlign: 'justify' }));

  return (
    <div className="rte">
      <div className="rte-toolbar" role="toolbar" aria-label="Formatting">
        <fieldset className="rte-group">
          <legend className="rte-group-legend">Font</legend>
          <select
            className="rte-select rte-select--family"
            aria-label="Font family"
            title="Font family"
            value={editor.getAttributes('textStyle').fontFamily || ''}
            onChange={(event) => {
              const { value: family } = event.target;
              if (family) {
                editor.chain().focus().setFontFamily(family).run();
              } else {
                editor.chain().focus().unsetFontFamily().run();
              }
            }}
          >
            <option value="">Font</option>
            {FONT_FAMILIES.map((family) => (
              <option key={family.value} value={family.value}>
                {family.label}
              </option>
            ))}
          </select>
          <select
            className="rte-select rte-select--size"
            aria-label="Font size"
            title="Font size"
            value={editor.getAttributes('textStyle').fontSize || ''}
            onChange={(event) => {
              const { value: size } = event.target;
              if (size) {
                editor.chain().focus().setFontSize(size).run();
              } else {
                editor.chain().focus().unsetFontSize().run();
              }
            }}
          >
            <option value="">16</option>
            {FONT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </fieldset>

        <div className="rte-divider" aria-hidden="true" />

        <fieldset className="rte-group">
          <legend className="rte-group-legend">Text style</legend>
          <button
            type="button"
            className={`rte-button ${editor.isActive('bold') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
            aria-pressed={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive('italic') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
            aria-pressed={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive('underline') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Underline"
            aria-pressed={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive('strike') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Strikethrough"
            aria-pressed={editor.isActive('strike')}
            title="Strikethrough — draws a line through the selected text"
          >
            <s>S</s>
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive('superscript') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            aria-label="Superscript"
            aria-pressed={editor.isActive('superscript')}
            title="Superscript — raises text above the baseline, e.g. x²"
          >
            X<sup>2</sup>
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive('subscript') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            aria-label="Subscript"
            aria-pressed={editor.isActive('subscript')}
            title="Subscript — lowers text below the baseline, e.g. x₂"
          >
            X<sub>2</sub>
          </button>
        </fieldset>

        <div className="rte-divider" aria-hidden="true" />

        <fieldset className="rte-group">
          <legend className="rte-group-legend">Color</legend>
          <label className="rte-button rte-color-trigger" title="Text color — changes the color of the selected text">
            A
            <span className="rte-color-bar" style={{ backgroundColor: textColor }} aria-hidden="true" />
            <input
              type="color"
              className="rte-color-input"
              aria-label="Text color"
              value={textColor}
              onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
            />
          </label>
          <div className="rte-highlight-palette" aria-label="Highlight color">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`rte-swatch ${editor.isActive('highlight', { color: color.value }) ? 'is-active' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
                aria-label={`Highlight ${color.label}`}
                aria-pressed={editor.isActive('highlight', { color: color.value })}
                title={`Highlight text in ${color.label.toLowerCase()}`}
              />
            ))}
            <button
              type="button"
              className="rte-button rte-clear-highlight"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              aria-label="Remove highlight"
              title="Remove highlight from the selected text"
            >
              ✕
            </button>
          </div>
        </fieldset>

        <div className="rte-divider" aria-hidden="true" />

        <fieldset className="rte-group">
          <legend className="rte-group-legend">Lists and blocks</legend>
          <button
            type="button"
            className={`rte-button ${editor.isActive('bulletList') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Bullet list"
            aria-pressed={editor.isActive('bulletList')}
            title="Bulleted list — starts an unordered list"
          >
            • ≡
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive('orderedList') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Numbered list"
            aria-pressed={editor.isActive('orderedList')}
            title="Numbered list — starts an ordered list"
          >
            1. ≡
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive('blockquote') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            aria-label="Blockquote"
            aria-pressed={editor.isActive('blockquote')}
            title="Blockquote — indents text as a quotation"
          >
            ❝
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive('code') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleCode().run()}
            aria-label="Inline code"
            aria-pressed={editor.isActive('code')}
            title="Inline code — formats the selection as code"
          >
            {'</>'}
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            aria-label="Code block"
            aria-pressed={editor.isActive('codeBlock')}
            title="Code block — formats the paragraph as a code block"
          >
            {'{ }'}
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive('link') ? 'is-active' : ''}`}
            onClick={handleSetLink}
            aria-label="Link"
            aria-pressed={editor.isActive('link')}
            title="Insert link — adds a hyperlink to the selected text"
          >
            🔗
          </button>
        </fieldset>

        <div className="rte-divider" aria-hidden="true" />

        <fieldset className="rte-group">
          <legend className="rte-group-legend">Alignment</legend>
          <button
            type="button"
            className={`rte-button ${isLeftAligned ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            aria-label="Align left"
            aria-pressed={isLeftAligned}
            title="Align left"
          >
            ⇤
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            aria-label="Align center"
            aria-pressed={editor.isActive({ textAlign: 'center' })}
            title="Align center"
          >
            ⇔
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            aria-label="Align right"
            aria-pressed={editor.isActive({ textAlign: 'right' })}
            title="Align right"
          >
            ⇥
          </button>
          <button
            type="button"
            className={`rte-button ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            aria-label="Justify"
            aria-pressed={editor.isActive({ textAlign: 'justify' })}
            title="Justify — aligns text evenly along both margins"
          >
            ☰
          </button>
        </fieldset>
      </div>

      <EditorContent className="rte-content" editor={editor} />
    </div>
  );
};

export default RichTextEditor;

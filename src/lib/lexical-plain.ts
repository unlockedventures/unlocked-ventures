import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

/** Build a minimal Lexical document from plain paragraphs (for seeds / fallbacks). */
export function lexicalFromParagraphs(paragraphs: readonly string[]): DefaultTypedEditorState {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text) => ({
          type: 'paragraph',
          format: '' as const,
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          textFormat: 0,
          textStyle: '',
          children: [
            {
              type: 'text' as const,
              text,
              detail: 0,
              format: 0,
              mode: 'normal' as const,
              style: '',
              version: 1,
            },
          ],
        })),
    },
  }
}

export function lexicalFromHeadingAndParagraphs(
  heading: string,
  paragraphs: readonly string[],
): DefaultTypedEditorState {
  const base = lexicalFromParagraphs(paragraphs)
  return {
    root: {
      ...base.root,
      children: [
        {
          type: 'heading',
          tag: 'h2',
          format: '' as const,
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          children: [
            {
              type: 'text' as const,
              text: heading,
              detail: 0,
              format: 0,
              mode: 'normal' as const,
              style: '',
              version: 1,
            },
          ],
        },
        ...base.root.children,
      ],
    },
  }
}

import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { DefaultTypedEditorState, SerializedBlockNode, SerializedUploadNode } from '@payloadcms/richtext-lexical'
import type { ComponentProps, ReactNode } from 'react'

import { MediaEmbed } from '@/components/site/media-embed'
import { cn } from '@/lib/utils'

type MediaEmbedFields = {
  blockType: 'mediaEmbed'
  url?: string | null
  caption?: string | null
}

type RichTextProps = {
  data: DefaultTypedEditorState | null | undefined
  className?: string
}

function uploadUrl(node: SerializedUploadNode): string | null {
  const value = node.value
  if (!value || typeof value !== 'object') return null
  const url = (value as { url?: string | null }).url
  return typeof url === 'string' && url.trim() ? url : null
}

function uploadAlt(node: SerializedUploadNode): string {
  const value = node.value
  if (!value || typeof value !== 'object') return ''
  const alt = (value as { alt?: string | null }).alt
  return typeof alt === 'string' ? alt : ''
}

function uploadCaption(node: SerializedUploadNode): string | null {
  const fields = node.fields
  if (!fields || typeof fields !== 'object') return null
  const caption = (fields as { caption?: string | null }).caption
  return typeof caption === 'string' && caption.trim() ? caption : null
}

export function RichText({ data, className }: RichTextProps) {
  if (!data?.root?.children?.length) return null

  return (
    <LexicalRichText
      data={data as ComponentProps<typeof LexicalRichText>['data']}
      converters={({ defaultConverters }) => ({
        ...defaultConverters,
        upload: ({ node }) => {
          const src = uploadUrl(node)
          if (!src) return null
          const caption = uploadCaption(node)
          const alt = uploadAlt(node) || caption || ''
          const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src)

          return (
            <figure className="my-8 w-full">
              {isVideo ? (
                <video controls className="h-auto w-full bg-[#111]" preload="metadata">
                  <source src={src} />
                </video>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt} className="h-auto w-full" loading="lazy" />
              )}
              {caption ? (
                <figcaption className="mt-3 font-sans text-sm leading-5 text-[#484D56]">{caption}</figcaption>
              ) : null}
            </figure>
          )
        },
        blocks: {
          ...((defaultConverters.blocks as Record<string, unknown> | undefined) ?? {}),
          mediaEmbed: ({ node }: { node: SerializedBlockNode<MediaEmbedFields> }) => {
            const url = node.fields?.url
            if (!url) return null as unknown as ReactNode
            return <MediaEmbed url={url} caption={node.fields?.caption} />
          },
        },
      })}
      className={cn(
        'uv-rich-text font-sans text-base leading-7 text-[#23313C]',
        '[&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:font-sans [&_h2]:text-[1.75rem] [&_h2]:leading-9 [&_h2]:font-normal [&_h2]:tracking-[-0.5px] [&_h2]:text-[#33353F]',
        '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-sans [&_h3]:text-[1.375rem] [&_h3]:leading-8 [&_h3]:font-normal [&_h3]:text-[#33353F]',
        '[&_p]:mb-4 [&_p]:max-w-[42rem]',
        '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6',
        '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6',
        '[&_li]:mb-2',
        '[&_a]:text-[#1CACAE] [&_a]:underline-offset-2 hover:[&_a]:underline',
        '[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-[#1CACAE] [&_blockquote]:pl-4 [&_blockquote]:text-[#484D56]',
        '[&_img]:my-8 [&_img]:h-auto [&_img]:w-full [&_img]:max-w-full',
        '[&_figure]:my-8',
        className,
      )}
    />
  )
}

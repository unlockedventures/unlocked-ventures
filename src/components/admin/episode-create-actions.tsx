'use client'

import { Button, useConfig } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { rememberEpisodeCreateMode } from '@/components/admin/episode-editor-mode'

const HOST_CLASS = 'uv-episode-create-actions'
const HIDE_STYLE_ID = 'uv-episode-hide-default-create'

/** Replaces Episodes list "Create New" with Create with AI + Create Manually. */
export function EpisodeCreateActions() {
  const { config } = useConfig()
  const [host, setHost] = useState<Element | null>(null)
  const adminRoute = config.routes.admin
  const aiHref = `${adminRoute}/collections/podcast-episodes/create?mode=ai`
  const manualHref = `${adminRoute}/collections/podcast-episodes/create?mode=manual`

  useEffect(() => {
    if (!document.getElementById(HIDE_STYLE_ID)) {
      const style = document.createElement('style')
      style.id = HIDE_STYLE_ID
      style.textContent = `
        .collection-list--podcast-episodes .list-header__title-actions > .list-create-new-doc__create-new-button {
          display: none !important;
        }
      `
      document.head.appendChild(style)
    }

    const ensureHost = () => {
      const list = document.querySelector('.collection-list--podcast-episodes')
      if (!list) return null

      const titleActions = list.querySelector('.list-header__title-actions')
      if (!titleActions) return null

      let actions = titleActions.querySelector(`.${HOST_CLASS}`)
      if (!actions) {
        actions = document.createElement('div')
        actions.className = HOST_CLASS
        actions.setAttribute(
          'style',
          'display:flex;flex-wrap:wrap;align-items:center;gap:calc(var(--base) * 0.5);',
        )
        titleActions.appendChild(actions)
      }
      return actions
    }

    setHost(ensureHost())
    const observer = new MutationObserver(() => {
      setHost(ensureHost())
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      document.querySelectorAll(`.${HOST_CLASS}`).forEach((el) => el.remove())
    }
  }, [])

  if (!host) return null

  return createPortal(
    <>
      <Button
        aria-label="Create episode with AI"
        buttonStyle="pill"
        className="list-create-new-doc__create-new-button"
        el="link"
        onClick={() => rememberEpisodeCreateMode('ai')}
        size="small"
        to={aiHref}
      >
        Create with AI
      </Button>
      <Button
        aria-label="Create episode manually"
        buttonStyle="pill"
        className="list-create-new-doc__create-new-button"
        el="link"
        onClick={() => rememberEpisodeCreateMode('manual')}
        size="small"
        to={manualHref}
      >
        Create Manually
      </Button>
    </>,
    host,
  )
}

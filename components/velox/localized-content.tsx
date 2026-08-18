'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLanguage } from './language-context'
import { translateLegacyText } from './legacy-content-translations'

const attributes = ['placeholder', 'aria-label', 'title'] as const

export function LocalizedContent({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const originals = useRef(new WeakMap<Text, string>())
  const lastText = useRef(new WeakMap<Text, string>())
  const originalAttributes = useRef(new WeakMap<Element, Map<string, string>>())
  const lastAttributes = useRef(new WeakMap<Element, Map<string, string>>())
  const { language, t } = useLanguage()

  function localize(root: Node) {
    const shared = t as unknown as Record<string, string>
    const textNodes: Text[] = []
    if (root.nodeType === Node.TEXT_NODE) textNodes.push(root as Text)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) textNodes.push(walker.currentNode as Text)

    for (const node of textNodes) {
      const parent = node.parentElement
      if (!parent || parent.closest('[data-no-translate]') || ['SCRIPT', 'STYLE'].includes(parent.tagName)) continue
      const current = node.nodeValue ?? ''
      const previousTranslation = lastText.current.get(node)
      if (!originals.current.has(node) || (previousTranslation !== undefined && current !== previousTranslation)) {
        originals.current.set(node, current)
      }
      const original = originals.current.get(node) ?? current
      const next = translateLegacyText(original, language, shared)
      lastText.current.set(node, next)
      if (current !== next) node.nodeValue = next
    }

    const elements: Element[] = root.nodeType === Node.ELEMENT_NODE ? [root as Element] : []
    if (root instanceof Element || root instanceof DocumentFragment) elements.push(...root.querySelectorAll('*'))
    for (const element of elements) {
      if (element.closest('[data-no-translate]')) continue
      let originalsForElement = originalAttributes.current.get(element)
      let lastForElement = lastAttributes.current.get(element)
      if (!originalsForElement) {
        originalsForElement = new Map()
        originalAttributes.current.set(element, originalsForElement)
      }
      if (!lastForElement) {
        lastForElement = new Map()
        lastAttributes.current.set(element, lastForElement)
      }
      for (const attribute of attributes) {
        const current = element.getAttribute(attribute)
        if (current === null) continue
        const previousTranslation = lastForElement.get(attribute)
        if (!originalsForElement.has(attribute) || (previousTranslation !== undefined && current !== previousTranslation)) {
          originalsForElement.set(attribute, current)
        }
        const original = originalsForElement.get(attribute) ?? current
        const next = translateLegacyText(original, language, shared)
        lastForElement.set(attribute, next)
        if (current !== next) element.setAttribute(attribute, next)
      }
    }
  }

  useLayoutEffect(() => {
    if (rootRef.current) localize(rootRef.current)
  }, [language, t])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') localize(mutation.target)
        for (const node of mutation.addedNodes) localize(node)
        if (mutation.type === 'attributes') localize(mutation.target)
      }
    })
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...attributes] })
    return () => observer.disconnect()
  }, [language, t])

  return <div ref={rootRef}>{children}</div>
}

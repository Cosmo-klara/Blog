import config from 'virtual:config'
import type { WalineEmojiPresets } from '@waline/client'

const walineConfig = config.integ.waline

class Comment extends HTMLElement {
  connectedCallback() {
    void this.initialize()
  }

  async initialize() {
    ;(globalThis as unknown as { __VUE_OPTIONS_API__: boolean }).__VUE_OPTIONS_API__ = true
    ;(globalThis as unknown as { __VUE_PROD_DEVTOOLS__: boolean }).__VUE_PROD_DEVTOOLS__ = false
    ;(globalThis as unknown as { __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: boolean }).__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false

    const emoji = walineConfig.emoji?.map(
      (preset) => `${config.npmCDN}/@waline/emojis@1.2.0/${preset}` as WalineEmojiPresets
    )
    const [{ init }] = await Promise.all([
      import('@waline/client'),
      import('@waline/client/style')
    ])

    init({
      el: 'comment-component #waline',
      serverURL: walineConfig.server || '',
      emoji,
      reaction: ['/icons/heart-item.svg'],
      ...walineConfig.additionalConfigs
    })
  }
}

if (walineConfig.enable && !customElements.get('comment-component')) {
  customElements.define('comment-component', Comment)
}

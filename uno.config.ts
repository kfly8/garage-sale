import { defineConfig, presetUno, presetAttributify, presetTypography } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography()
  ],
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      danger: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b'
    }
  }
})

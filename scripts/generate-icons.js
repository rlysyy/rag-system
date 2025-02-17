const fs = require('fs')
const path = require('path')

const icons = {
  pdf: { color: '#DC2626', text: 'PDF' },
  doc: { color: '#2563EB', text: 'DOC' },
  xlsx: { color: '#059669', text: 'XLS' },
  csv: { color: '#047857', text: 'CSV' },
  txt: { color: '#4B5563', text: 'TXT' },
  default: { color: '#6B7280', text: '' }
}

const iconTemplate = (color, text) => `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 4C5 3.44772 5.44772 3 6 3H21.5858C21.851 3 22.1054 3.10536 22.2929 3.29289L26.7071 7.70711C26.8946 7.89464 27 8.149 27 8.41421V28C27 28.5523 26.5523 29 26 29H6C5.44772 29 5 28.5523 5 28V4Z" fill="white" stroke="#E5E5E5"/>
  <path d="M22 3.5V7C22 7.55228 22.4477 8 23 8H26.5L22 3.5Z" fill="#E5E5E5" stroke="#E5E5E5"/>
  <rect x="5" y="11" width="22" height="11" fill="${color}"/>
  ${text ? `<text x="8" y="19.5" font-size="7.5" fill="white" font-family="Arial, sans-serif" font-weight="bold" letter-spacing="0.5" dy="0">${text}</text>` : ''}
</svg>
`
const iconsDir = path.join(process.cwd(), 'public', 'icons', 'file-types')

// 确保目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// 生成图标文件
Object.entries(icons).forEach(([name, { color, text }]) => {
  const svg = iconTemplate(color, text)
  fs.writeFileSync(path.join(iconsDir, `${name}.svg`), svg.trim())
  console.log(`Generated ${name}.svg`)
}) 

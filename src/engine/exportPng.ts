function collectCss(): string {
  const chunks: string[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) chunks.push(rule.cssText)
    } catch {
      continue
    }
  }
  return chunks.join('\n')
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export async function exportCardPng(
  node: HTMLElement,
  filename: string,
  scale = 2,
): Promise<void> {
  const clone = node.cloneNode(true) as HTMLElement
  clone.style.transform = 'none'
  clone.style.margin = '0'

  const width = node.offsetWidth
  const height = node.offsetHeight
  if (!width || !height) throw new Error('卡面尚未渲染完成')

  const css = collectCss()
  const markup = new XMLSerializer().serializeToString(clone)

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<foreignObject x="0" y="0" width="100%" height="100%">` +
    `<div xmlns="http://www.w3.org/1999/xhtml"><style>${css}</style>${markup}</div>` +
    `</foreignObject></svg>`

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

  const image = new Image()
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('图片合成失败'))
    image.src = dataUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建画布')
  ctx.scale(scale, scale)
  ctx.drawImage(image, 0, 0, width, height)

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('无法生成图片'))
        return
      }
      triggerDownload(blob, filename)
      resolve()
    }, 'image/png')
  })
}
/**
 * html2html
 * 使用场景
 * 1. pdf 生成
 * 2. page clone + 快速预览
 * 3. 骨架屏
 * 受限制的地方
 * 1. 图片、svg、ttf 字体，这3种不会去做处理，所以最终渲染结果可能会和页面有所差异
 */

class DomCloner {
  constructor(element) {
    this.referenceElement = element
    this.referenceElementCloner = null
    this.documentElement = this.cloneNode(element.ownerDocument.documentElement)
    this.dofix()
  }
  cloneNode(node) {
    if (node.nodeType === 3) {
      return document.createTextNode(node.data)
    }
    if (node.nodeType === 1) {
      const clone = this.createElementClone(node)
      for (let child = node.firstChild; child; child = child.nextSibling) {
        if (child.tagName !== 'SCRIPT') {
          clone.appendChild(this.cloneNode(child))
        }
      }
      return clone
    }
    return node.cloneNode(false)
  }
  createElementClone(node) {
    if (node.tagName === 'CANVAS' || node.tagName === 'SCRIPT' || (node.tagName === 'LINK' && /(\.js\?|\.js$)/.test(node.getAttribute('href')))) {
      return document.createTextNode('')
    }
    const clone = node.cloneNode(false)
    if (!node.contains(this.referenceElement) && !this.referenceElement.contains(node)) {
      clone.style.display = 'none'
    }
    if (node === this.referenceElement) {
      this.referenceElementCloner = clone
    }
    return clone
  }
  getLinkData() {
    const links = this.documentElement.getElementsByTagName('link')
    const arrLinks = [...links].filter(node => (node.getAttribute('rel') === 'stylesheet' || node.getAttribute('type') === 'text/css'))
    return new Promise(resolve => {
      let resolvers = 0
      const reg = new RegExp(`^(http:|https:)?\/\/${location.host}`)
      arrLinks.forEach(async node => {
        const href = node.getAttribute('href')
        // 同域则改成 style 获取，跨域则保持 link 不变。- 用以解决同域登录态问题
        // 获取子路径文件、或者同域文件
        if (!/^http/.test(href) || reg.test(href)) {
          try {
            const data = await fetch(node.getAttribute('href'), {
              credentials: 'same-origin',
              mode: 'cors'
            })
            if (data.ok) {
              const css = await data.text()
              const style = document.createElement('style')
              style.textContent = css
              node.replaceWith(style)
            }
          } catch {}
        }
        ++resolvers
        if (resolvers === arrLinks.length) {
          resolve()
        }
      })
    })
  }
  dofix() {
    this.fixHeight()
    this.fixUrl(this.documentElement.getElementsByTagName('link'))
    this.fixUrl(this.documentElement.getElementsByTagName('img'))
  }
  fixHeight() {
    if (!this.referenceElementCloner) { return }
    let parent = this.referenceElementCloner.parentNode
    while (parent) {
      parent.style.height = 'unset'
      parent.style.width = '100vw'
      parent.style.minWidth = '100vw'
      parent.style.overflowY = 'unset'
      parent.style.padding = '0'
      parent.style.margin = '0'
      parent = parent.parentNode
    }
  }
  fixUrl(doms) {
    if (doms instanceof HTMLCollection) {
      const protocol = location.protocol
      doms = [...doms]
      doms.forEach(node => {
        const attrType = node.hasAttribute('href') ? 'href' : 'src'
        const value = node.getAttribute(attrType)
        if (/^(\/\/)/.test(value)) { node.setAttribute(attrType, protocol + value) }
      })
    }
  }
  destory() {
    this.referenceElement = null
    this.referenceElementCloner = null
    this.documentElement = null
  }
}

async function html2html(dom) {
  const cloneDocument = new DomCloner(dom)
  await cloneDocument.getLinkData()
  const html = cloneDocument.documentElement.outerHTML
  cloneDocument.destory()
  return html
}

const download = string => {
  const eleLink = document.createElement('a')
  eleLink.download = 'test.html'
  eleLink.style.display = 'none'
  eleLink.href = URL.createObjectURL(new File([string], 'test.html'))
  document.body.appendChild(eleLink)
  eleLink.click()
  document.body.removeChild(eleLink)
}

(async () => {
  const str = await html2html(document.documentElement)
  download(str)
})()

// export default html2html

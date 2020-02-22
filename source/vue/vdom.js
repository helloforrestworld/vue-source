const vnodeType = {
  HTML: 'HTML',
  TEXT: 'TEXT',
  COMPONENT: 'COMPONENT',
  CLASS_COMPONENT: 'CLASS_COMPONENT'
}

const childType = {
  EMPTY: 'EMPTY',
  SINGLE: 'SINGLE',
  MULTIPLE: 'MULTIPLE'
}

export function createElement(tag, data, children = null) {
  let flag
  if (typeof tag === 'string') {
    flag = vnodeType.HTML
  } else if (typeof tag === 'function') {
    flag = vnodeType.COMPONENT
  } else {
    flag = vnodeType.TEXT
  }

  let childrenFrag
  if (children === null) {
    childrenFrag = childType.EMPTY
  } else if (Array.isArray(children)) {
    const length = children.length
    if (length === 0) {
      childrenFrag = childType.EMPTY
    } else {
      childrenFrag = childType.MULTIPLE
    }
  } else {
    // 其他情况认为是一个文本
    childrenFrag = childType.SINGLE
    children = createTextNode(children + '')
  }

  return {
    flag,
    tag,
    data,
    children,
    childrenFrag,
    el: null
  }
}

export function render(vnode, container) {
  // 区分首次渲染和再次渲染
  mount(vnode, container)
}

function mount(vnode, container) {
  const { flag } = vnode
  if (flag === vnodeType.HTML) {
    mountElement(vnode, container)
  } else if (flag === vnodeType.TEXT) {
    mountText(vnode, container)
  }
}

function mountElement(vnode, container) {
  const { tag, data, children, childrenFrag } = vnode
  const dom = document.createElement(tag)
  vnode.el = dom

  if (data) {
    for (const key in data) {
      patchData(dom, key, null, data[key])
    }
  }

  if (childrenFrag !== childType.EMPTY) {
    if (childrenFrag === childType.SINGLE) {
      mount(children, dom)
    } else if (childrenFrag === childType.MULTIPLE) {
      for (let i = 0; i < children.length; i++) {
        mount(children[i], dom)
      }
    }
  }
  container.appendChild(dom)
}

function mountText(vnode, container) {
  const dom = document.createTextNode(vnode.children)
  vnode.el = dom
  container.appendChild(dom)
}

function patchData(el, key, prev, next) {
  switch (key) {
    case 'style':
      for (const k in next) {
        el.style[k] = next[k]
      }
      break
    case 'class':
      el.className = next
      break
    default:
      if (key[0] === '@') {
        el.addEventListener(key.slice(1), next)
      } else {
        el.setAttribute(key, next)
      }
  }
}

// 新建文本vnode
function createTextNode(text) {
  return {
    flag: vnodeType.TEXT,
    tag: null,
    data: null,
    children: text,
    childType: childType.EMPTY
  }
}

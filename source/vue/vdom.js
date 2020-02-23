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
    key: data && data.key,
    children,
    childrenFrag,
    el: null
  }
}

export function render(vnode, container) {
  // 区分首次渲染和再次渲
  if (container.vnode) {
    patch(container.vnode, vnode, container)
  } else {
    mount(vnode, container)
  }
  container.vnode = vnode
}

function patch(prev, next, container) {
  const nextFlag = next.flag
  const prevFlag = prev.flag

  // vnode类型不一样，直接替换新的。
  if (nextFlag !== prevFlag) {
    replaceVnode(prev, next, container)
  } else if (nextFlag === vnodeType.HTML) {
    patchElement(prev, next, container)
  } else if (nextFlag === vnodeType.TEXT) {
    patchText(prev, next)
  }
}

function patchElement(prev, next, container) {
  // 标签不一样，直接替换新的
  if (prev.tag !== next.tag) {
    replaceVnode(prev, next, container)
  }
  // 更新data
  const el = next.el = prev.el
  const nextData = next.data
  const prevData = prev.data
  if (nextData) {
    // 新增或覆盖旧属性
    for (const key in nextData) {
      const prevVal = prevData[key]
      const nextVal = nextData[key]
      patchData(el, key, prevVal, nextVal)
    }
  }
  if (prevData) {
    // 删除新vnode没有的属性
    for (const key in prevData) {
      const prevVal = prevData[key]
      if (prevVal && !nextData.hasOwnProperty(key)) {
        patchData(el, key, prevVal, null)
      }
    }
  }
  // 更新子元素
  updateChildren(
    prev.childrenFrag,
    next.childrenFrag,
    prev.children,
    next.children,
    el
  )
}

function updateChildren(
  prevChildFrag,
  nextChildFrag,
  prevChildren,
  nextChildren,
  container
) {
  switch (prevChildFrag) {
    case childType.SINGLE:
      switch (nextChildFrag) {
        case childType.SINGLE:
          patch(prevChildren, nextChildren, container)
          break
        case childType.EMPTY:
          container.removeChild(prevChildren.el)
          break
        case childType.MULTIPLE:
          container.removeChild(prevChildren.el)
          for (let i = 0; i < nextChildren.length; i++) {
            mount(nextChildren[i], container)
          }
          break
      }
      break
    case childType.EMPTY:
      switch (nextChildFrag) {
        case childType.SINGLE:
          mount(nextChildren, container)
          break
        case childType.EMPTY:
          break
        case childType.MULTIPLE:
          for (let i = 0; i < nextChildren.length; i++) {
            mount(nextChildren[i], container)
          }
          break
      }
      break
    case childType.MULTIPLE:
      switch (nextChildFrag) {
        case childType.SINGLE:
          for (let i = 0; i < prevChildren.length; i++) {
            container.removeChild(prevChildren[i].el)
          }
          mount(nextChildren, container)
          break
        case childType.EMPTY:
          for (let i = 0; i < prevChildren.length; i++) {
            container.removeChild(prevChildren[i].el)
          }
          break
        case childType.MULTIPLE: {
          let lastIndex = 0
          for (let i = 0; i < nextChildren.length; i++) {
            let find = false
            const nextVnode = nextChildren[i]
            let j = 0
            for (j; j < prevChildren.length; j++) {
              const prevVnode = prevChildren[j]
              if (prevVnode.key === nextVnode.key) {
                find = true
                patch(prevVnode, nextVnode, container)
                if (j < lastIndex) {
                  // 需要移动
                  const flagNode = nextChildren[i - 1].el.nextSibling
                  container.insertBefore(prevVnode.el, flagNode)
                  break
                } else {
                  lastIndex = j
                }
              }
            }
            if (!find) {
              // 需要新增
              const flagNode = i === 0 ? prevChildren[0].el : nextChildren[i - 1].el.nextSibling
              mount(nextVnode, container, flagNode)
            }
          }

          // 移除不需要的元素
          for (let i = 0; i < prevChildren.length; i++) {
            const prevVnode = prevChildren[i]
            const has = nextChildren.find(next => next.key === prevVnode.key)
            if (!has) {
              container.removeChild(prevVnode.el)
            }
          }
          break
        }
      }
      break
    default:
      break
  }
}

function patchText(prev, next) {
  const el = next.el = prev.el
  if (next.children !== prev.children) {
    el.nodeValue = next.children
  }
}

function replaceVnode(prev, next, container) {
  container.removeChild(prev.el)
  mount(next, container)
}

function mount(vnode, container, flagNode) {
  const { flag } = vnode
  if (flag === vnodeType.HTML) {
    mountElement(vnode, container, flagNode)
  } else if (flag === vnodeType.TEXT) {
    mountText(vnode, container)
  }
}

function mountElement(vnode, container, flagNode) {
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

  flagNode ? container.insertBefore(dom, flagNode) : container.appendChild(dom)
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
      for (const k in prev) {
        if (!next || !next.hasOwnProperty(k)) {
          el.style[k] = ''
        }
      }
      break
    case 'class':
      el.className = next
      break
    default:
      if (key[0] === '@') {
        if (prev) {
          el.removeEventListener(key.slice(1), prev)
        }
        if (next) {
          el.addEventListener(key.slice(1), next)
        }
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

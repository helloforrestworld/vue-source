const vnodeType = {
  HTML: 'HTML',
  TEXT: 'TEXT',
  COMPONENT: 'COMPONENT'
}

const childType = {
  EMPTY: 'EMPTY',
  SINGLE: 'SINGLE',
  MULTIPLE: 'MULTIPLE'
}

/* 创建元素节点 */
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
    childrenFrag = childType.SINGLE
    if (isPrimitive(children)) {
      children = createTextNode(children + '')
    }
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

/* 创建文本节点 */
function createTextNode(text) {
  return {
    flag: vnodeType.TEXT,
    tag: null,
    data: null,
    children: text,
    childType: childType.EMPTY
  }
}

export function render(vnode, container) {
  /* 区分首次渲染和再次渲染 */
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

  /* vnode类型不一样，直接替换新的。 */
  if (nextFlag !== prevFlag) {
    replaceVnode(prev, next, container)
  } else if (nextFlag === vnodeType.HTML) {
    patchElement(prev, next, container)
  } else if (nextFlag === vnodeType.TEXT) {
    patchText(prev, next)
  }
}

function patchElement(prev, next, container) {
  /* 标签不一样，直接替换新的 */
  if (prev.tag !== next.tag) {
    replaceVnode(prev, next, container)
  }
  /* 更新data */
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
    /* 删除新vnode没有的属性 */
    for (const key in prevData) {
      const prevVal = prevData[key]
      if (prevVal && !nextData.hasOwnProperty(key)) {
        patchData(el, key, prevVal, null)
      }
    }
  }
  /* 更新子元素 */
  patchChildren(
    prev.childrenFrag,
    next.childrenFrag,
    prev.children,
    next.children,
    el
  )
}

function patchChildren(
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
        case childType.MULTIPLE:
          updateChildren(prevChildren, nextChildren, container)
      }
      break
  }
}

/* 两个子节点数组diff */
function updateChildren(
  prevChildren,
  nextChildren,
  container
) {
  let oldStartIdx = 0
  let oldEndIdx = prevChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = nextChildren.length - 1

  let oldStartVnode = prevChildren[0]
  let oldEndVnode = prevChildren[oldEndIdx]
  let newStartVnode = nextChildren[0]
  let newEndVnode = nextChildren[newEndIdx]
  let oldKeyToIdx, vnodeToMove

  /* 新旧只要有一个左游标超出右游标，循环结束 */
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode === undefined) {
      /* 因为后面对比key的时候如果找到相同会把它置为undefined，循环到该节点直接跳过 */
      oldStartVnode = prevChildren[++oldStartIdx]
    } else if (oldEndVnode === undefined) {
      /* 因为后面对比key的时候如果找到相同会把它置为undefined，循环到该节点直接跳过 */
      oldEndVnode = prevChildren[--oldEndIdx]
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      /* 旧头和新头都相同，patch旧节点 */
      patch(oldStartVnode, newStartVnode, container)
      oldStartVnode = prevChildren[++oldStartIdx]
      newStartVnode = nextChildren[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      /* 旧尾和新尾都相同，patch旧节点 */
      patch(oldEndVnode, newEndVnode, container)
      oldEndVnode = prevChildren[--oldEndIdx]
      newEndVnode = nextChildren[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      /* 旧头和新尾相同，patch旧节点，把旧节点移动到右侧 */
      patch(oldStartVnode, newEndVnode, container)
      container.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = prevChildren[++oldStartIdx]
      newEndVnode = nextChildren[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      /* 旧尾和新头相同，patch旧节点，把旧节点移动到左侧 */
      patch(oldEndVnode, newStartVnode, container)
      container.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = prevChildren[--oldEndIdx]
      newStartVnode = nextChildren[++newStartIdx]
    } else {
      /* 头尾对比完毕，开始对比key */
      if (!newStartVnode.key) {
        /* newStartVnode没有key，创建新元素 */
        mount(newStartVnode, container, oldStartVnode.el)
      } else {
        /*
          oldKeyToIdx: prevChildren key的映射对象
          例如[{tag: 'div', key: 'key1'}, {tag: 'div', key: 'key2'}] => {key1: 0, key2: 1}
        */
        if (!oldKeyToIdx) oldKeyToIdx = createKeyToOldIdx(prevChildren, oldStartIdx, oldEndIdx)

        let idxInOld = oldKeyToIdx[newStartVnode.key]
        if (!idxInOld) {
          /* newStartVnode有key，但是在旧的vnode没找着，同样创建新元素 */
          mount(newStartVnode, container, oldStartVnode.el)
        } else {
          vnodeToMove = prevChildren[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            /* 找到可以被复用的元素 */
            patch(vnodeToMove, newStartVnode, container)
            /* 旧vnode置为undefined */
            prevChildren[idxInOld] = undefined
            /* 移动找到的元素 */
            container.insertBefore(vnodeToMove.el, oldStartVnode.el)
          } else {
            /* 找到相同key，但是是不是用一个元素，可能tag不同等，同样创建新元素 */
            mount(newStartVnode, container, oldStartVnode.el)
          }
        }
      }
      /* 更新一下游标循环继续 */
      newStartVnode = nextChildren[++newStartIdx]
    }
  }
  /* while循环结束 */
  if (oldStartIdx > oldEndIdx) {
    /* 旧vnode节点集合先被遍历完成，说明还有新节点需要加入 */
    for (; newStartIdx <= newEndIdx; newStartIdx++) {
      /* nextChildren[newEndIdx + 1] === undefined，newEndIdx在最右边，这个时候flagNode = null，默认会appendChild */
      const flagNode = nextChildren[newEndIdx + 1] === undefined ? null : nextChildren[newEndIdx + 1].el
      mount(nextChildren[newStartIdx], container, flagNode)
    }
  } else if (newStartIdx > newEndIdx) {
    /* 新vnode节点集合先被遍历完成，说明需要移除多余的节点 */
    for (; oldStartIdx <= oldEndIdx; oldStartIdx++) {
      container.removeChild(prevChildren[oldStartIdx].el)
    }
  }
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

function patchText(prev, next) {
  const el = next.el = prev.el
  if (next.children !== prev.children) {
    el.nodeValue = next.children
  }
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

function replaceVnode(prev, next, container) {
  container.removeChild(prev.el)
  mount(next, container)
}

function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  let i, key
  const map = {}
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key
    if (isDef(key)) map[key] = i
  }
  return map
}

function isDef (v) {
  return v !== undefined && v !== null
}

function sameVnode (a, b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&
    isDef(a.data) === isDef(b.data)
  )
}

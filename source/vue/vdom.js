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
  // 区分首次渲染和再次渲染
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
        case childType.MULTIPLE:
          let oldStartIdx = 0
          let oldEndIdx = prevChildren.length - 1
          let newStartIdx = 0
          let newEndIdx = nextChildren.length - 1

          let oldStartVnode = prevChildren[0]
          let oldEndVnode = prevChildren[oldEndIdx]
          let newStartVnode = nextChildren[0]
          let newEndVnode = nextChildren[newEndIdx]
          let oldKeyToIdx, vnodeToMove

          // 新旧只要有一个左游标超出右游标，循环结束
          while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode === undefined) { // 当旧的vnode被移到左边后
              oldStartVnode = prevChildren[++oldStartIdx]
            } else if (oldEndVnode === undefined) {
              oldEndVnode = prevChildren[--oldEndIdx]
            } else if (sameVnode(oldStartVnode, newStartVnode)) {
              patch(oldStartVnode, newStartVnode, container)
              oldStartVnode = prevChildren[++oldStartIdx]
              newStartVnode = nextChildren[++newStartIdx]
            } else if (sameVnode(oldEndVnode, newEndVnode)) {
              patch(oldEndVnode, newEndVnode, container)
              oldEndVnode = prevChildren[--oldEndIdx]
              newEndVnode = nextChildren[--newEndIdx]
            } else if (sameVnode(oldStartVnode, newEndVnode)) {
              patch(oldStartVnode, newEndVnode, container)
              // 旧头和新尾相同，把旧节点移动到右侧
              container.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
              oldStartVnode = prevChildren[++oldStartIdx]
              newEndVnode = nextChildren[--newEndIdx]
            } else if (sameVnode(oldEndVnode, newStartVnode)) {
              // 旧尾和新头相同，把旧节点移动到左侧
              container.insertBefore(oldEndVnode.el, oldStartVnode.el)
              oldEndVnode = prevChildren[--oldEndIdx]
              newStartVnode = nextChildren[++newStartIdx]
            } else {
              // 头尾对比完毕，开始对比key
              if (!newStartVnode.key) { // newStartVnode没有key，创建新元素
                mount(newStartVnode, container, oldStartVnode.el)
              } else {
                // oldChildren key的映射对象
                if (!oldKeyToIdx) oldKeyToIdx = createKeyToOldIdx(prevChildren, oldStartIdx, oldEndIdx)

                let idxInOld = oldKeyToIdx[newStartVnode.key]
                if (!idxInOld) { // newStartVnode有key，但是在旧的vnode没找着，同样创建新元素
                  mount(newStartVnode, container, oldStartVnode.el)
                } else {
                  vnodeToMove = prevChildren[idxInOld]
                  if (sameVnode(vnodeToMove, newStartVnode)) {
                    // 找到可以被复用的元素
                    patch(vnodeToMove, newStartVnode, container)
                    // 旧vnode置为undefined
                    prevChildren[idxInOld] = undefined
                    // 移动找到的元素
                    container.insertBefore(vnodeToMove.el, newStartVnode.el)
                  } else {
                    // 找到相同key，但是是不是用一个元素，可能tag不同等，同样创建新元素
                    mount(newStartVnode, container, oldStartVnode.el)
                  }
                }
              }
              // 更新一下游标循环继续
              newStartVnode = nextChildren[++newStartIdx]
            }
          }
          // while循环结束
          if (oldStartIdx > oldEndIdx) {
            // 旧vnode节点集合先被遍历完成，说明还有新节点需要加入
            for (; newStartIdx <= newEndIdx; newStartIdx++) {
              // 如果newEndIdx还在最右侧，说明最右侧元素还没被挂载，元素直接append到容器最后面就得。
              // 如果nextChildren[newEndIdx + 1]不能于undefined，说明右侧的元素有部分被挂载了，所以元素需要往它前面insert。
              const flagNode = nextChildren[newEndIdx + 1] === undefined ? null : nextChildren[newEndIdx + 1].el
              mount(nextChildren[newStartIdx], container, flagNode)
            }
          } else if (newStartIdx > newEndIdx) {
            // 新vnode节点集合先被遍历完成，说明需要移除多余的节点
            for (; oldStartIdx <= oldEndIdx; oldStartIdx++) {
              container.removeChild(prevChildren[oldStartIdx].el)
            }
          }
      }
      break
  }
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

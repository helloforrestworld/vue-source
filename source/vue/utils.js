// (?:.|\r?\n) 任意字符或者是回车
// 非贪婪模式 `{{a}} {{b}}` 保证识别到是两组而不是一组
const defaultReg = /\{\{((?:.|\r?\n)+?)\}\}/g

const utils = {
  getValue(vm, expr) {
    const keys = expr.split('.')
    return keys.reduce((memo, current) => {
      return memo[current]
    }, vm)
  },
  complierText(node, vm) {
    // 第一次渲染时给node添加自定义属性存放模版
    if (!node.expr) {
      node.expr = node.textContent
    }
    // 替换模版中的表达式，更新到节点的textContent中
    node.textContent = node.expr.replace(defaultReg, (...args) => {
      return utils.getValue(vm, args[1])
    })
  }
}

export function complier(node, vm) {
  const childNodes = node.childNodes

  ;[...childNodes].forEach(child => {
    if (child.nodeType === 1) { // 元素节点
      complier(child, vm)
    } else if (child.nodeType === 3) { // 文本节点
      utils.complierText(child, vm)
    }
  })
}

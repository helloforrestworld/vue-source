import { createElement, render } from 'vue/vdom'

const vnode = createElement('div', { id: 'box' }, [
  createElement('p', { key: 'a', '@click': () => { alert(1) } }, '节点1'),
  createElement('p', { key: 'b', style: { color: 'red' } }, '节点2'),
  createElement('p', { key: 'c', class: 'header' }, '节点3'),
  createElement('p', { key: 'd' }, '节点4')
])

console.log(vnode)

render(vnode, document.getElementById('app'))

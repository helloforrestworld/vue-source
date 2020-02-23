import { createElement, render } from 'vue/vdom'

const vnode = createElement('div', { id: 'box' }, [
  createElement('p', { key: 'a', '@click': () => { alert(1) } }, '节点1'),
  createElement('p', { key: 'b', style: { color: 'red' } }, '节点2'),
  createElement('p', { key: 'c', class: 'header' }, '节点3'),
  createElement('p', { key: 'd' }, '节点4')
])

const vnode1 = createElement('div', { id: 'box' }, [
  createElement('p', { key: 'e', '@click': () => { alert(1) } }, '新增的节点1'),
  createElement('p', { key: 'a' }, '节点1'),
  createElement('p', { key: 'b', style: { color: 'blue' } }, '节点2'),
  createElement('p', { key: 'c', class: 'header' }, '节点3'),
  createElement('p', { key: 'f' }, '新增的节点2'),
  createElement('p', { key: 'd' }, '节点4')
])

setTimeout(() => {
  render(vnode1, document.getElementById('app'))
}, 1000)

render(vnode, document.getElementById('app'))

import { initState } from './observe'
import Watcher from './observe/watcher'
import { complier } from './utils'

// 使用构造函数 不使用es6类，方便原型方法拆分
function Vue (options) {
  this._init(options)
}

Vue.prototype._init = function (options) {
  const vm = this
  vm.$options = options

  // MVVM原理，需要将所有数据重新初始化
  // 包括data、watch、computed
  initState(vm)

  if (options.el) {
    vm.$mount()
  }
}

Vue.prototype.$mount = function () {
  const vm = this
  // eslint-disable-next-line no-unused-vars
  let el = vm.$options.el
  el = vm.$el = query(el)

  // 渲染/更新逻辑
  const updateComponent = () => {
    vm._update()
  }

  // 渲染时通过 watcher 来渲染
  // vue2.0组件级别的更新
  new Watcher(vm, updateComponent)
}

Vue.prototype._update = function () {
  const vm = this
  const el = vm.$el

  const node = document.createDocumentFragment() // 内存中创建文档碎片，然后操作文档碎片，完成替换后替换到页面，提高性能
  let firstChild
  while (firstChild = el.firstChild) {
    node.appendChild(firstChild) // appendChild 如果元素存在 将会剪贴
  }
  complier(node, vm)
  el.appendChild(node)
}

function query(el) {
  if (typeof el === 'string') {
    return document.querySelector(el)
  }
  return el
}

export default Vue

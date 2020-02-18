import { initState } from './observe'

// 使用构造函数 不使用es6类，方便原型方法拆分
function Vue (options) {
  this._init(options)
}

Vue.prototype._init = function (options) {
  const vm = this
  vm.$options = options

  // MVVM原理，需要将所有数据重新初始化
  initState(vm) // data watch computed
}

export default Vue

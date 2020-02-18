let id = 0 // 每个watcher的标识
class Watcher {
  /**
   *
   * @param {*} vm 当前Vue实例
   * @param {*} exprOrFn 表达式或者函数 vm.$watch('msg', cb) 如'msg'
   * @param {*} cb  表达式或者函数 vm.$watch('msg', cb) 如cb
   * @param {*} opts 其他的一些参数
   */
  constructor(vm, exprOrFn, cb = () => {}, opts = {}) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    if (typeof exprOrFn === 'function') {
      this.getter = exprOrFn
    }
    this.cb = cb
    this.opts = opts
    this.id = id++

    this.get() // 创建watcher时候默认会调用一次get方法
  }

  get() {
    this.getter && this.getter()
  }
}

export default Watcher

import { pushTarget, popTarget } from './dep'

let id = 0 // 每个watcher的标识
class Watcher {
  /**
   *
   * @param {Vue} vm 当前Vue实例
   * @param {string|function} exprOrFn 表达式或者函数 vm.$watch('msg', cb) 如'msg'
   * @param {function} cb  表达式或者函数 vm.$watch('msg', cb) 如cb
   * @param {Object} opts 其他的一些参数
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

    this.deps = []
    this.depIds = new Set()

    // 创建watcher时候默认会调用一次get方法
    this.get()
  }

  get() {
    // 往Dep添加一个target，指向当前watcher
    pushTarget(this)
    this.getter && this.getter()
    // getter执行完毕后，把当前watcher从Dep.target中剔除
    popTarget()
  }

  update() {
    console.log('update1')
    queueWatcher(this)
  }

  addDep(dep) {
    const id = dep.id
    if (!this.depIds.has(id)) {
      this.depIds.add(id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }

  run() {
    console.log('run')
    this.get()
  }
}

const queueIds = new Set()
let queue = []
function flaskQueue() {
  if (!queue.length) return
  queue.forEach(watcher => watcher.run())
  queueIds.clear()
  queue = []
}

function queueWatcher(watcher) {
  const id = watcher.id
  if (!queueIds.has(id)) {
    queueIds.add(id)
    queue.push(watcher)

    // TODO replace with nextTick
    setTimeout(flaskQueue, 0)
  }
}

export default Watcher

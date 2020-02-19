import { pushTarget, popTarget } from './dep'
import nextTick from './nextTick'
import { utils } from '../utils'

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
      // 渲染watcher的updateComponent函数
      // 或者是computed函数
      this.getter = exprOrFn
    } else if (typeof exprOrFn === 'string') {
      // 用户watcher
      // 解析expr，取到data上的值
      // 取值的时候完成依赖收集
      this.getter = function () {
        return utils.getValue(vm, exprOrFn)
      }
    }

    this.cb = cb
    this.opts = opts
    this.id = id++
    this.immediate = opts.immediate
    // 用户添加的watcher，标记一下
    this.user = opts.user
    // 标记是否为计算属性
    this.lazy = opts.lazy
    // 标记计算属性依赖是否变化了，是否需要重新计算值
    this.dirty = this.lazy

    // 记录当前watcher订阅的依赖
    this.deps = []
    this.depIds = new Set()

    // 创建watcher时候默认会调用一次get方法
    // 如果是计算属性，开始时默认不会去取值
    this.value = this.lazy ? undefined : this.get()

    if (this.immediate) {
      this.cb(this.value)
    }
  }

  get() {
    // 往Dep添加一个target，指向当前watcher
    pushTarget(this)
    const value = this.getter.call(this.vm)
    // getter执行完毕后，把当前watcher从Dep.target中剔除
    popTarget()
    return value
  }

  // 计算属性求值
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }

  update() {
    if (this.lazy) {
      // 计算属性watcher更新只需要把dirty改为true
      // 当获取计算属性时便会重新evaluate
      this.dirty = true
    } else {
      queueWatcher(this)
    }
  }

  depend() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  // 一个watcher对同一个dep只订阅一次
  addDep(dep) {
    const id = dep.id
    if (!this.depIds.has(id)) {
      this.depIds.add(id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }

  run() {
    const newValue = this.get()

    // 比较新旧值，执行用户添加的handler
    if (newValue !== this.value) {
      this.cb(newValue, this.value)
      this.value = newValue
    }
  }
}

const queueIds = new Set()
let queue = []
function flushQueue() {
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

    nextTick(flushQueue)
  }
}

export default Watcher

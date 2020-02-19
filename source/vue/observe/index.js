import Observer from './observer'
import Watcher from './watcher'
import Dep from './dep'

// 做不同的初始化工作
export function initState (vm) {
  const opts = vm.$options

  if (opts.data) {
    initData(vm)
  }

  if (opts.computed) {
    initComputed(vm)
  }

  if (opts.watch) {
    initWatch(vm)
  }
}

export function observe(data) {
  // 如果不是对象直接返回，不需要观察
  if (typeof data !== 'object' || data === null) {
    return
  }
  // 已经观察过的对象直接返回__ob__
  if (data.__ob__) {
    return data.__ob__
  }
  return new Observer(data)
}

function proxy(vm, key, source) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(newValue) {
      vm[source][key] = newValue
    }
  })
}

function initData(vm) {
  let data = vm.$options.data

  // 判断data是否为函数，然后取出data赋值给vm._data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}

  // 把_data的属性映射到vm上
  for (const key in data) {
    proxy(vm, key, '_data')
  }

  // 将用户插入的数据，用Object.definedProperty重新定义
  observe(vm._data)
}

// 计算属性getter工厂函数
function createComputedGetter(vm, key) {
  const watcher = vm._watchersComputed[key]
  return function () {
    if (watcher) {
      // 只有当依赖变化的时候需要重新evaluate
      if (watcher.dirty) {
        watcher.evaluate()
      }
      // 让计算属性的依赖添加一个渲染watcher
      // 这样每个计算属性依赖都会有一个computed watcher和一个渲染watcher
      if (Dep.target) {
        watcher.depend()
      }
    }
    return watcher.value
  }
}

function initComputed(vm) {
  const computed = vm.$options.computed
  // 创建一个存放所有computed watcher的对象，存放在实例上
  const watchers = vm._watchersComputed = Object.create(null)
  for (const key in computed) {
    watchers[key] = new Watcher(vm, computed[key], () => {}, { lazy: true })

    // 把计算属性定义到vm上。
    Object.defineProperty(vm, key, {
      get: createComputedGetter(vm, key)
    })
  }
}

function initWatch(vm) {
  const watch = vm.$options.watch
  for (const key in watch) {
    const useDef = watch[key]
    createWatcher(vm, key, useDef)
  }
}

function createWatcher(vm, key, useDef) {
  vm.$watch(key, useDef)
}

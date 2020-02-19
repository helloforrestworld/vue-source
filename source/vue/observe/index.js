import Observer from './observer'

// 做不同的初始化工作
export function initState (vm) {
  const opts = vm.$options

  if (opts.data) {
    initData(vm)
  }

  if (opts.computed) {
    initComputed()
  }

  if (opts.watch) {
    initWatch()
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

function initComputed() {

}

function initWatch() {

}

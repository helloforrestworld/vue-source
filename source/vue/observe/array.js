import { observe } from './index'

const methods = [
  'push',
  'unshift',
  'pop',
  'shift',
  'reverse',
  'sort',
  'splice'
]

const arrayProto = Array.prototype

export const newArrayProto = Object.create(arrayProto)

// 劫持了部分数组的方法
methods.forEach(method => {
  newArrayProto[method] = function (...args) {
    // 调用原数组方法
    const r = arrayProto[method].apply(this, args)

    // 对新增的元素进行观测
    let inserted
    switch (method) {
      case 'push':
      case 'shift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
    }
    observeArray(inserted)

    // 找到Observer实例化时添加的dep，并通知更新。
    this.__ob__.dep.notify()
    return r
  }
})

export function observeArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    observe(arr[i])
  }
}

export function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    const item = value[i]
    item.__ob__ && item.__ob__.dep.depend()

    if (Array.isArray(item)) {
      dependArray(item)
    }
  }
}

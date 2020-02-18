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

    // TODO

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
    return r
  }
})

export function observeArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    observe(arr[i])
  }
}

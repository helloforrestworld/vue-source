import { observe } from './index'
import { newArrayProto, observeArray } from './array'
import Dep from './dep'

export function defineReactive(data, key, value) {
  // 如果value是对象的话，需要继续观察一层
  observe(value)

  // 给每个属性都添加一个dep
  const dep = new Dep()

  Object.defineProperty(data, key, {
    get() {
      console.log('获取数据')
      // 取数据的时候进行依赖收集
      if (Dep.target) {
        dep.addSub(Dep.target)
      }
      return value
    },
    set(newValue) {
      if (newValue === value) return

      observe(newValue) // 如果设置的值是对象的话，需要继续观察一层
      console.log(`设置属性:${value} => ${newValue}`)

      // defineReactive执行是一个闭包，value值会共享。
      value = newValue

      // 数据变化，通知更新视图
      dep.notify()
    }
  })
}

class Observer {
  constructor(data) {
    if (Array.isArray(data)) {
      // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/proto
      // data.__proto__ = newArrayProto
      Object.setPrototypeOf(data, newArrayProto)
      observeArray(data)
    } else {
      this.walk(data)
    }
  }

  walk(data) {
    const keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = data[key]

      defineReactive(data, key, value)
    }
  }
}

export default Observer

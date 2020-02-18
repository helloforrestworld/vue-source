import { observe } from './index'

export function defineReactive(data, key, value) {
  // 如果value是对象的话，需要继续观察一层
  observe(value)

  Object.defineProperty(data, key, {
    get() {
      console.log('获取数据')
      return value
    },
    set(newValue) {
      if (newValue === value) return
      console.log(`设置属性:${value} => ${newValue}`)

      value = newValue
    }
  })
}

class Observer {
  constructor(data) {
    this.walk(data)
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

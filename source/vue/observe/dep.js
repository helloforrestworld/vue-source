let id = 0
class Dep {
  constructor() {
    this.id = id++
    this.subs = [] // 存放watcher订阅者
  }

  addSub(watcher) {
    this.subs.push(watcher)
  }

  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}

// 保存当前watcher
// 后面使用
const stack = []
export function pushTarget(watcher) {
  Dep.target = watcher
  stack.push(watcher)
}

export function popTarget() {
  stack.pop()
  Dep.target = stack[stack.length - 1]
}

export default Dep

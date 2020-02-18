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

  // 让dep跟watcher相互记忆
  // 同一个dep不能添加相同的watcher
  depend() {
    if (Dep.target) { // 防止depend被直接调用
      Dep.target.addDep(this)
    }
  }
}

// 保存当前watcher
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

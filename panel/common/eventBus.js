// eventBus.js
class EventBus {
  constructor() {
    this.events = {}
  }

  // 监听事件
  on (eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    this.events[eventName].push(callback)
  }

  // 触发事件
  emit (eventName, ...args) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        callback(...args)
      })
    }
  }

  // 取消监听
  off (eventName, callback) {
    if (this.events[eventName]) {
      if (callback) {
        const index = this.events[eventName].indexOf(callback)
        if (index > -1) {
          this.events[eventName].splice(index, 1)
        }
      } else {
        // 如果没有传入 callback，则移除所有该事件的监听
        delete this.events[eventName]
      }
    }
  }

  // 一次性监听
  once (eventName, callback) {
    const wrapper = (...args) => {
      callback(...args)
      this.off(eventName, wrapper)
    }
    this.on(eventName, wrapper)
  }
}

// 创建全局唯一的 EventBus 实例
const eventBus = new EventBus()

export default eventBus
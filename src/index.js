import Vue from 'vue'

// eslint-disable-next-line no-unused-vars
const vm = new Vue({
  el: '#app',
  data() {
    return {
      msg: 'hello, world',
      obj: { name: 'forrest', age: 12 },
      arr: [{ a: 1 }, 1, 2, 3]
    }
  },
  computed: {

  },
  watch: {

  }
})

// console.log(vm.obj.name)
// vm.obj.name = 'Ben'
// vm.arr.push({ a: 1 })
// console.log(vm.arr[3].a)
// console.log(vm.arr[0].a)
// vm.arr[0].a = 123

window.vm = vm

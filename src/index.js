import Vue from 'vue'

// eslint-disable-next-line no-unused-vars
const vm = new Vue({
  el: '#app',
  data() {
    return {
      msg: 'hello, world',
      obj: { name: 'forrest', age: 12 },
      arr: [[0], 1, 2, 3],
      firstName: 'Forrest',
      lastName: 'Lau'
    }
  },
  computed: {
    fullName() {
      return this.firstName + this.lastName
    }
  },
  watch: {
    // msg: {
    //   handler: function (newValue, oldValue) {
    //     console.log({
    //       newValue,
    //       oldValue
    //     })
    //   },
    //   immediate: true
    // }
  }
})

// console.log(vm.obj.name)
// vm.obj.name = 'Ben'
// vm.arr.push({ a: 1 })
// console.log(vm.arr[3].a)
// console.log(vm.arr[0].a)
// vm.arr[0].a = 123

window.vm = vm

// vm.$watch('msg', function (newValue, oldValue) {
//   console.log({
//     newValue,
//     oldValue
//   })
// })

// vm.$watch('msg', {
//   handler: function (newValue, oldValue) {
//     console.log({
//       newValue,
//       oldValue
//     })
//   },
//   immediate: true
// })

setTimeout(() => {
  // vm.msg = 'haha'
  // vm.msg = 'xixi'
  // vm.msg = 'papa'
  // vm.arr.push(100)
  // vm.arr[0].push(100)
}, 1000)

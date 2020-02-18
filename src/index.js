import Vue from 'vue'

const vm = new Vue({
  el: '#app',
  data() {
    return {
      msg: 'hello, world',
      obj: { name: 'forrest', age: 12 },
      arr: [1, 2, 3]
    }
  },
  computed: {

  },
  watch: {

  }
})

// console.log(vm.obj.name)
vm.obj.name = 'Ben'

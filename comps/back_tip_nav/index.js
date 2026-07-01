const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: ''
    },
    showBack: {
      type: Boolean,
      value: true
    },
    rightTxt: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    title: '',
    skin: plugin.main.getSkin(),
  },
  lifetimes: {
    attached() {},
  },
  /**
   * 组件的方法列表
   */
  methods: {
    back () {
      this.triggerEvent('NavBack', true)
    },
    onDelete(){
      this.triggerEvent('delete')
    }
  }
})

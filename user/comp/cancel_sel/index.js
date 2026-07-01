
const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    uname: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    i18n: '',
    skin: '',
    type: 2,
    count: 9,
    isEnd: false,
    afterSeven: '',
    tipShow: false,
    cancelImg: plugin.main.getBaseImgUrl() + 'images/mine/cancel_icon.png'
  },

  lifetimes: {
    attached: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
      this.count()
    },
    detached: function () { }
  },

  pageLifetimes: {
    show: function () {
      let seven = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() + 86400000 * 7
      let date = new Date(seven)
      let afterSeven = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
      this.setData({
        afterSeven
      })
    },
    hide: function () { }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 倒计时
     */
    count () {
      let self = this
      let count = self.data.count
      let timer = setInterval(() => {
        if (count > 0) {
          count--
          self.setData({
            count,
            isEnd: (count > 0 ? false : true)
          })
        } else {
          clearInterval(timer) //清除js定时器
          self.setData({
            isEnd: true
          })
        }
      }, 1000)
    },
    /**
      * 注销用户
      */
    cancelShow (e) {
      let self = this
      self.setData({
        type: e.currentTarget.dataset.type,
        tipShow: true
      })
    },
    /**
     * 关闭
     */
    onClose () {
      this.setData({
        tipShow: false
      })
    },
    /**
     * 确认注销
     */
    cancel () {
      let self = this
      let item = {
        type: self.data.type,
        uname: self.properties.uname
      }
      self.triggerEvent('Send', item)
    }
  }
})

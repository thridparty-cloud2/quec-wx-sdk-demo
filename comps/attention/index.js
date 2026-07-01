Component({
  /**
   * 组件的属性列表
   */
  properties: {
    vshow: {
      type: Boolean
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    open: true
  },

  observers: {
    "vshow": function (vshow) {
      if (vshow) {
        if (wx.getStorageSync('taihe_attention_open')) {
          let open = JSON.parse(wx.getStorageSync('taihe_attention_open'))
          this.setData({
            open
          })
        } else {
          this.setData({
            open: true
          })
        }
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 是否展开
     */
    open () {
      this.setData({
        open: !this.data.open
      })
      wx.setStorageSync('taihe_attention_open', JSON.stringify(this.data.open))
    },

    /**
     * 跳转关注
     */
    play () {
      // Demo: saas 已移除
    }
  }
})

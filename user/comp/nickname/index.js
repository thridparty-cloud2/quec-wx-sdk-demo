const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    nikeName: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    nikeName: '',
    i18n: '',
    skin: '',
  },

  lifetimes: {
    attached: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
    },
    detached: function () {
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeNickname (e) {
      let self = this
      let newNickName = plugin.jsValid.trimField(e.detail)
      self.setData({
        nikeName: newNickName
      })
    },

    blurNickname (e) {
      let self = this
      let newNickName = e.detail.value
      self.setData({
        nikeName: newNickName
      })
    },

    nicknameSubmit (e) {
      let self = this
      if (plugin.jsValid.validNickname(self.data.nikeName)) {
        return plugin.jsUtil.tip(self.data.i18n['validTip'])
      }
      if (self.data.nikeName.length < 1) {
        return
      }
      plugin.quecUser.editNickname({
        nikeName: self.data.nikeName,
        success (res) {
          if (Number(res.code) == 200) {
            plugin.jsUtil.tip(self.data.i18n['nicknameSuccTip'], 'success')
            plugin.jsUtil.delayCb(() => {
              self.triggerEvent('nicknameEditSuccess', true)
            })
          }
        },
        fail (res) { }
      })
    },
  }
})

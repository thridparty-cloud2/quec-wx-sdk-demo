const plugin = requirePlugin('quecPlugin')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    fid: {//家庭id
      type: String
    },
    delShow: {
      type: Boolean
    },
    selDevice: {//选中的数据
      type: Array,
      value: []
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    i18n: '',
    skin: '',
    delFailShow: false, //删除失败弹窗
    batchFailList: [], //批量删除失败列表
  },

  lifetimes: {
    ready: function () {
      this.setData({
        i18n: plugin.main.getLang(),
        skin: plugin.main.getSkin()
      })
    },
    detached: function () { }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
    * 多设备删除
    */
    multDelConfirm () {
      let self = this
      let { selDevice, fid } = self.properties
      let dlist = []
      selDevice.forEach((s) => {
        dlist.push({
          pk: s.productKey,
          dk: s.deviceKey
        })
      })
      plugin.quecManage.batchDeviceUnBind({
        fid,
        pkdkDtoList: dlist,
        success (res) {
          if (res.data.failList) {
            let failList = res.data.failList
            if (failList.length == 0) {
              plugin.jsUtil.tip(self.data.i18n['delSuccTip'], 'success')
              plugin.jsUtil.delayCb(() => {
                self.triggerEvent('unbindSuccess', true)
              }, 500)
            } else {
              failList.forEach((f) => {
                selDevice.forEach((s) => {
                  if (f.pk == s.productKey && f.dk == s.deviceKey) {
                    f.deviceName = s.deviceName
                  }
                })
              })
              self.setData({
                delFailShow: true,
                batchFailList: failList
              })
            }
          }
        },
        fail (res) { }
      })
    },

    /**
     * 确定失败列表
     */
    failConfirm () {
      let self = this
      plugin.jsUtil.delayCb(() => {
        self.triggerEvent('unbindSuccess', true)
      }, 500)
    }
  }
})

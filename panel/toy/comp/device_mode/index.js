const plugin = requirePlugin("quecPlugin")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    curItem: {
      type: Object,
    },
    visible: {
      type: Boolean,
    },
    deviceModeObj: {
      type: Object,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectedValue: null,
  },
  pageLifetimes: {},
  observers: {
    deviceModeObj (newDeviceModeObj) {
      // 当deviceModeObj变化时，初始化selectedValue为当前值
      if (newDeviceModeObj && newDeviceModeObj.vdata !== undefined) {
        this.setData({
          selectedValue: newDeviceModeObj.vdata,
        })
      }
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 选择模式（只更新选中状态）
     */
    selectMode (e) {
      let selectedValue = e.detail
      this.setData({
        selectedValue: selectedValue,
      })
    },

    /**
     * 确认模式修改
     */
    onConfirm () {
      let self = this
      let { curItem } = self.properties
      let { selectedValue } = self.data

      if (
        curItem?.productKey === undefined ||
        curItem?.deviceKey === undefined
      ) {
        return
      }

      if (selectedValue === null || selectedValue === undefined) {
        wx.showToast({
          title: '请选择模式',
          icon: 'none'
        })
        return
      }

      wx.nextTick(() => {
        let pk = curItem.productKey
        let dk = curItem.deviceKey
        console.log(selectedValue)
        console.log(self.properties.deviceModeObj)
        let sendData = [
          {
            [self.properties.deviceModeObj.code]: selectedValue,
          },
        ]
        let type = "WRITE-ATTR"
        plugin.jsUtil.load(10000)
        plugin.socket.send({
          pk,
          dk,
          type,
          sendData,
          success (res) {
            console.log(res)
            self.onClose()
          },
          fail (res) {
            console.log(res)
          },
        })
      })
    },

    onClose () {
      // 重置选中值到初始状态
      if (this.properties.deviceModeObj && this.properties.deviceModeObj.vdata !== undefined) {
        this.setData({
          selectedValue: this.properties.deviceModeObj.vdata,
        })
      }
      // 可以传递任意 detail
      this.triggerEvent("closeModeHandleVisible", { reason: "userClick" })
    },
  },
})

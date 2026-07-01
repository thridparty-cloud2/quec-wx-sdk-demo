Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean
    },
    plan: {
      type: Object
    },
    argsItem: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    plan: {},
    argsItem: {},
    componentType: {
      0: '模组',
      1: 'MCU'
    }
  },

  lifetimes: {
    attached: function () {
      let self = this
      console.log('plan:')
      console.log(self.properties.plan)
    },
    detached: function () {

    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /**
     * 关闭升级提示
     */
    upgradeClose () {
      // this.clearStroage()
      this.triggerEvent('Close')
    },

    /**
     * 去升级页面
     */
    goUpgrade () {
      let self = this
      let { argsItem } = self.properties
      self.upgradeClose()
      this.pageRouter.navigateTo({
        url: `/panel/ota/cloud/upgrade/index?info=${encodeURIComponent(JSON.stringify(argsItem))}`
      })
    },

    // clearStroage () {
    //   let self = this
    //   if (wx.getStorageSync('cloud_ota_plan')) {
    //     let cloudData = JSON.parse(wx.getStorageSync('cloud_ota_plan'))
    //     let newArr = cloudData.filter(item => item.planId !== self.properties.plan.planId)
    //     wx.setStorageSync('cloud_ota_plan', JSON.stringify(newArr))
    //   }
    // }

  }
})

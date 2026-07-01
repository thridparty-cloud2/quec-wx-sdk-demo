import tConst from "../../js/homeConst.js"
const plugin = requirePlugin("quecPlugin")
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    role: {
      type: Object
    },
    device: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tConst: tConst,
    roleImg: '',
    isAn: false,
    isChuo: false,
    key: 'ai-qme-chuo',

    isTip: false,
    isClick: false
    // fadeAn: null
  },

  observers: {
    'role': function (role) {
      let self = this
      if (JSON.stringify(role) !== '{}') {
        self.setData({
          roleImg: role.rolePicUrl
        })
        if (role.themeAnimation) {
          self.setData({
            isAn: true,
          })
          self.getChuoStorage()
        } else {
          self.setData({
            isAn: false,
            isTip: false
          })
        }

      }
    }
  },


  /**
   * 组件的方法列表
   */
  methods: {
    chuo () {
      let self = this
      self.setData({
        isChuo: !self.data.isChuo,
        isClick: true
      })
      self.setChuoStorage()
      plugin.jsUtil.delayCb(() => {
        self.setData({
          isClick: false
        })
      }, 1000)
    },

    /**
     * 存储
     */
    setChuoStorage () {
      let self = this
      let { device } = self.properties
      let stArr = []
      let flag = false
      if (wx.getStorageSync(self.data.key)) {
        stArr = JSON.parse(wx.getStorageSync(self.data.key))
        let idx = stArr.findIndex(item => (item.productKey === device.productKey && item.deviceKey === device.deviceKey))
        if (idx !== -1) {
          flag = true
        }
      }
      if (!flag && self.data.isChuo) {
        stArr.push({
          productKey: device.productKey,
          deviceKey: device.deviceKey,
          isChuo: self.data.isChuo
        })
        wx.setStorageSync(self.data.key, JSON.stringify(stArr))
      }
      self.getChuoStorage()
    },

    /**
     * 获取
     */
    getChuoStorage () {
      let self = this
      let { device } = self.properties
      let stArr = []
      if (wx.getStorageSync(self.data.key)) {
        stArr = JSON.parse(wx.getStorageSync(self.data.key))
        let idx = stArr.findIndex(item => (item.productKey === device.productKey && item.deviceKey === device.deviceKey))
        self.setData({
          isTip: (idx == -1 ? true : false)
        })
      }
    },

    animateFn () {
      let self = this
      let animation = wx.createAnimation({
        duration: 2000,
        timingFunction: 'ease-in-out'
      })
      animation.opacity(1).step()
      self.setData({
        fadeAn: animation.export()
      })
    }
  }
})
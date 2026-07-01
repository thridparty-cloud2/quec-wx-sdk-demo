import riskConst from "../../../../js/riskConst.js"

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    device: {
      type: Object,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    device: {},
    riskConst: riskConst,

    isRecording: false, //是否正在录音
    isAuth: false, //是否有录音权限
    isCancelled: false, // 是否已取消
    isCancelArea: false, // 是否进入取消区域
    hasShownAuthModal: false, // 是否已展示过授权提示弹窗

    recordDuration: 0,
    recordTimer: null,
    recordStartTime: 0,

    startX: 0,
    startY: 0,
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
    attached() {
      // 组件加载时预先检查权限
      this.checkAuth()
    },
    detached() {
      this.cancel()
    },
  },
  pageLifetimes: {
    hide() {
      this.cancel()
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 预检录音授权
    checkAuth() {
      let self = this
      wx.getSetting({
        success: (res) => {
          if (res.authSetting["scope.record"]) {
            self.setData({
              isAuth: true,
            })
          } else {
            self.setData({
              isAuth: false,
            })
          }
        },
        fail: () => {
          self.setData({
            isAuth: false,
          })
        },
      })
    },

    start(e) {
      let self = this
      const device = self.properties.device || {}

      if (device.onlineStatus !== 1 || device.shareCode) {
        return
      }

      if (e && e.touches && e.touches[0]) {
        self.data.startX = e.touches[0].clientX
        self.data.startY = e.touches[0].clientY
      }

      if (self.data.isRecording) return

      if (!self.data.isAuth) {
        self.getAuth()
        return
      }

      self.setData({
        isRecording: true,
        isCancelArea: false, // 重置取消区域状态
      })
      self.triggerEvent("RecordState", { isRecording: true })
      self.recording()
    },

    touchMove(e) {
      if (!this.data.isRecording) return

      const touch = e.touches[0]
      const moveX = touch.clientX
      const moveY = touch.clientY
      const diffX = Math.abs(moveX - this.data.startX)
      const diffY = Math.abs(moveY - this.data.startY)
      const threshold = 50

      if (diffX > threshold || diffY > threshold) {
        if (!this.data.isCancelArea) {
          this.setData({
            isCancelArea: true,
          })
        }
      } else {
        if (this.data.isCancelArea) {
          this.setData({
            isCancelArea: false,
          })
        }
      }
    },

    // 请求录音权限
    getAuth() {
      let self = this
      wx.authorize({
        scope: "scope.record",
        success: () => {
          self.setData({
            isAuth: true,
            isRecording: false,
          })
        },
        fail: () => {
          self.setData({
            isAuth: false,
            isRecording: false,
          })
          // 兜底引导
          if (!self.data.hasShownAuthModal) {
            self.setData({ hasShownAuthModal: true })
            wx.showModal({
              title: "提示",
              content: "需要录音权限才能使用该功能，请去设置中开启",
              success(res) {
                if (res.confirm) {
                  wx.openSetting({
                    success(settingRes) {
                      if (settingRes.authSetting["scope.record"]) {
                        self.setData({ isAuth: true })
                      }
                    },
                  })
                }
              },
            })
          }
        },
      })
    },

    /**
     * 录音
     */
    recording() {
      let self = this
      self.setData({
        recordDuration: 0,
        recordStartTime: Date.now(),
      })
      // 开始录音
      const recorderManager = wx.getRecorderManager()
      recorderManager.onStart(() => {
        console.log("录音开始")
        if (self.data.recordTimer) {
          clearInterval(self.data.recordTimer)
        }
        self.data.recordTimer = setInterval(() => {
          const duration = Math.floor((Date.now() - self.data.recordStartTime) / 1000)
          self.setData({ recordDuration: duration })
          // 最长录制20秒自动停止
          if (duration >= 20) {
            self.end()
            wx.showToast({
              title: "录音时长超过最大限制20s,自动发送",
              icon: "none",
            })
          }
        }, 1000)
      })
      recorderManager.onStop((res) => {
        // console.log('录音结束', res)
        self.handle(res)
      })
      recorderManager.onError((res) => {
        //console.error('录音失败', res)
        // wx.showToast({
        //   title: '录音失败',
        //   icon: 'none'
        // })
        self.cancel()
      })
      // 录音配置
      const options = {
        duration: 20000, // 最长20秒
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 96000,
        format: "PCM",
        frameSize: 50,
      }
      recorderManager.start(options)
      self.recorderManager = recorderManager
    },

    // 结束录音
    end() {
      if (!this.data.isRecording) return

      if (this.data.isCancelArea) {
        this.cancel()
        return
      }

      clearInterval(this.data.recordTimer)
      if (this.recorderManager) {
        this.recorderManager.stop()
      }
      this.setData({
        isRecording: false,
        recordTimer: null,
      })
      this.triggerEvent("RecordState", { isRecording: false })
    },

    // 取消录音
    cancel() {
      this.setData({
        isCancelled: true,
      })
      if (this.recorderManager) {
        this.recorderManager.stop()
      }
      clearInterval(this.data.recordTimer)
      this.setData({
        isRecording: false,
        recordTimer: null,
        recordDuration: 0,
        isCancelArea: false, // 重置状态
      })
      this.triggerEvent("RecordState", { isRecording: false })
    },

    // 处理录音停止
    handle(res) {
      let self = this
      if (self.data.isCancelled) {
        self.setData({
          isCancelled: false,
        })
        return
      }
      const { tempFilePath, duration } = res
      if (tempFilePath && duration > 1000) {
        // 大于1秒才保存
        const recordItem = {
          tempFilePath,
          duration: Math.floor(duration / 1000),
          time: self.formatTime(new Date()),
          name: `录音_${self.formatTime(new Date(), true)}`,
        }
        self.triggerEvent("Result", recordItem)
      } else {
        wx.showToast({
          title: "录音时间太短",
          icon: "none",
        })
      }
    },

    // 格式化时间显示
    formatTime(date, isFileName = false) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const hour = String(date.getHours()).padStart(2, "0")
      const minute = String(date.getMinutes()).padStart(2, "0")
      const second = String(date.getSeconds()).padStart(2, "0")

      if (isFileName) {
        return `${year}${month}${day}_${hour}${minute}${second}`
      }

      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    },
  },
})

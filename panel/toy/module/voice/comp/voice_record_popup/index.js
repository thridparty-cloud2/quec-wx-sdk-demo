// 录音弹窗公共组件
const plugin = requirePlugin("quecPlugin")

// 录音相关全局变量
let recorderManager = null
let startY = 0
let isCancel = false
let isTouchDown = false // 跟踪用户是否按下按钮
let isOperationComplete = true // 跟踪操作是否完成，只有完成后才允许下一次操作
let isRecordingTimeout = false // 跟踪录音是否已超时
let recordStartTime = 0 // 录音开始时间戳
let isQuickProbe = false
let isStartPending = false
let hasStartedNativeRecord = false
let startRecordTimer = null
let lastCancelToastTime = 0
// 探测录音运行标志，防止并发与交互冲突
let isProbeRunning = false
// 噪音检测阈值常量
const NOISE_THRESHOLD = 60
const START_RECORD_DELAY = 150

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 弹窗显示状态
    show: {
      type: Boolean,
      value: false,
    },
    // 录音步骤 0: 权限请求, 1: 注意事项, 2: 录音界面
    step: {
      type: Number,
      value: 0,
    },
    // 弹窗标题
    title: {
      type: String,
      value: "",
    },
    // 语言类型
    langType: {
      type: String,
      value: "中文",
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 图片资源
    microPhoneImg: plugin.main.getRootImg() + "example/images/microPhone.png",

    // 录音状态相关
    recordTip: "按住录制",
    recordState: 0, // 0: 默认状态, 1: 录音中, 2: 取消状态
    isRecording: false,
    isRecorderInitialized: false,
    micStatus: "", //系统麦克风开启权限

    // 语言选择弹窗
    showChangeLangDialog: false,
  },

  // 监听系统麦克风授权是否开启
  observers: {
    show (newVal) {
      if (newVal) {
        const auth = wx.getAppAuthorizeSetting
          ? wx.getAppAuthorizeSetting()
          : {}
        const micStatus = auth.microphoneAuthorized || ""
        this.setData({ micStatus })
        if (micStatus !== "authorized") {
          this.startQuickRecordProbe()
        }
      } else {
        // 弹窗关闭时清理状态
        this.cleanupRecorder() + // 关闭录音弹窗时同步关闭语言选择弹窗
          +this.setData({ showChangeLangDialog: false })
      }
    },
  },

  ready () {
    const auth = wx.getAppAuthorizeSetting ? wx.getAppAuthorizeSetting() : {}
    this.setData({
      micStatus: auth.microphoneAuthorized || "",
    })
    console.log(this.data.micStatus)
  },

  // 组件卸载时进行彻底清理
  detached () {
    this.cleanupRecorder()
  },

  methods: {
    notifyCancelToast () {
      const now = Date.now()
      if (now - lastCancelToastTime < 400) {
        return
      }
      lastCancelToastTime = now
      wx.showToast({
        title: "录音取消",
        icon: "none",
      })
    },

    clearStartRecordTimer () {
      if (startRecordTimer) {
        clearTimeout(startRecordTimer)
        startRecordTimer = null
      }
    },

    // 统一的清理方法：停止录音、解绑监听、清理定时器、重置标志
    cleanupRecorder () {
      this.clearStartRecordTimer()
      if (this.recordTimeout) {
        clearTimeout(this.recordTimeout)
        this.recordTimeout = null
      }
      if (recorderManager) {
        try {
          recorderManager.stop()
        } catch (e) { }
        if (recorderManager.offStart) recorderManager.offStart()
        if (recorderManager.offFrameRecorded)
          recorderManager.offFrameRecorded()
        if (recorderManager.offStop) recorderManager.offStop()
        if (recorderManager.offError) recorderManager.offError()
        recorderManager = null
      }
      // 重置模块级状态标志
      startY = 0
      isCancel = false
      isTouchDown = false
      isOperationComplete = true
      isRecordingTimeout = false
      recordStartTime = 0
      isQuickProbe = false
      isStartPending = false
      hasStartedNativeRecord = false
      lastCancelToastTime = 0
      isProbeRunning = false
      // 重置组件内状态
      this.resetRecordingState()
      this.setData({ isRecorderInitialized: false })
    },

    /**
     * 初始化录音管理器
     */
    initRecorderManager () {
      if (this.data.isRecorderInitialized) return

      // 延迟创建录音管理器
      if (!recorderManager) {
        recorderManager = wx.getRecorderManager()
      }
      // 解绑可能残留的旧监听
      if (recorderManager.offStart) recorderManager.offStart()
      if (recorderManager.offFrameRecorded) recorderManager.offFrameRecorded()
      if (recorderManager.offStop) recorderManager.offStop()
      if (recorderManager.offError) recorderManager.offError()

      const self = this
      const volumeData = []
      // let isNoisy = false

      // 录音开始
      recorderManager.onStart(() => {
        console.log("录音开始")
        if (isQuickProbe) {
          return
        }
        volumeData.length = 0 // 清空数组
        isStartPending = false
        hasStartedNativeRecord = true
        recordStartTime = Date.now()
        // 真实录音开始后才通知上层，避免标题与按钮状态分裂
        self.triggerEvent("recordStart")

        if (self.recordTimeout) {
          clearTimeout(self.recordTimeout)
          self.recordTimeout = null
        }
        self.recordTimeout = setTimeout(() => {
          if (self.data.isRecording && hasStartedNativeRecord) {
            isRecordingTimeout = true
            recorderManager.stop()
          }
        }, 10000)
        //isNoisy = false
      })

      // 音量监听
      recorderManager.onFrameRecorded((res) => {
        const volume = self.calculateVolume(res.frameBuffer)
        volumeData.push(volume)
        //if (volume > NOISE_THRESHOLD) isNoisy = true
      })

      // 录音结束处理
      recorderManager.onStop((res) => {
        // 如果是探测录音触发录音结束，不进行正常处理
        if (isQuickProbe) {
          console.log("授权探测录音停止，忽略正常处理逻辑")
          isQuickProbe = false
          isProbeRunning = false
          const auth = wx.getAppAuthorizeSetting
            ? wx.getAppAuthorizeSetting()
            : {}
          const micStatus = auth.microphoneAuthorized || ""
          self.setData({ micStatus })
          // 确保状态复位，允许下一次正常操作
          self.resetRecordingState()
          isStartPending = false
          hasStartedNativeRecord = false
          isOperationComplete = true
          return
        }

        console.log("录音停止，res对象:", res)

        // 清除10秒超时定时器
        if (self.recordTimeout) {
          clearTimeout(self.recordTimeout)
          self.recordTimeout = null
        }

        // 重置取消标志，确保状态一致性
        const wasCanceled = isCancel
        const wasTimeout = isRecordingTimeout
        isCancel = false
        isRecordingTimeout = false
        isStartPending = false
        hasStartedNativeRecord = false

        // 重置录音状态
        self.setData({
          isRecording: false,
          recordTip: "按住录制",
          recordState: 0,
        })

        // 触发标题重置事件
        self.triggerEvent("titleReset")

        if (wasCanceled) {
          console.log("录音被取消")
          self.notifyCancelToast()
          isOperationComplete = true
          return
        }

        // 如果是超时停止，不处理录音文件
        if (wasTimeout) {
          console.log("录音超时")
          wx.showToast({
            title: "录音时间过长，请重新录制",
            icon: "none",
          })
          isOperationComplete = true
          return
        }

        // 检测录音时长，如果小于3秒则提示
        const recordDuration = Date.now() - recordStartTime
        if (recordDuration < 3000) {
          console.log("录音时间太短")
          wx.showToast({
            title: "录音时间太短",
            icon: "none",
          })
          // 确保操作完成标志被设置，允许下一次录音操作
          isOperationComplete = true
          return
        }

        // if (isNoisy || self.isEnvironmentNoisy(volumeData)) {
        //   console.log("环境嘈杂")
        //   wx.showToast({
        //     title: "环境嘈杂，请重新录制",
        //     icon: "none",
        //   })
        //   isOperationComplete = true
        //   return
        // }

        // 检查录音数据是否有效
        if (!res.tempFilePath) {
          console.error("录音组件：tempFilePath为空，不触发recordComplete事件")
          isOperationComplete = true
          return
        }

        // 触发录音完成事件，传递录音文件路径和时长
        self.triggerEvent("recordComplete", {
          tempFilePath: res.tempFilePath,
          duration: res.duration,
        })

        console.log("录音完成事件被触发")
        // 确保操作完成标志被设置，允许下一次录音操作
        isOperationComplete = true
      })

      recorderManager.onError((err) => {
        // 监听到探测录音不做处理
        if (isQuickProbe) {
          console.warn("授权探测录音错误，忽略正常错误处理", err)
          return
        }
        this.clearStartRecordTimer()
        this.resetRecordingState()
        isStartPending = false
        hasStartedNativeRecord = false
        isCancel = false
        isOperationComplete = true
      })

      this.setData({ isRecorderInitialized: true })
    },

    /**
     * 检测到未授权时，触发一次非常短的探测录音用来触发系统授权
     */
    startQuickRecordProbe () {
      // 如果正在正常录音或探测录音已在进行中，跳过探测
      if (this.data.isRecording || isProbeRunning) return
      this.initRecorderManager()
      isQuickProbe = true
      isProbeRunning = true
      // 探测期间禁止用户发起新的录音操作
      isOperationComplete = false
      // 启动一次极短录音以触发系统授权弹窗
      try {
        recorderManager.start({
          duration: 300,
          sampleRate: 24000,
          format: "PCM",
          numberOfChannels: 1,
          frameSize: 50,
        })
      } catch (e) { }
      setTimeout(() => {
        try {
          recorderManager.stop()
        } catch (e) { }
      }, 100)
    },

    /**
     * 重置录音状态
     */
    resetRecordingState () {
      this.setData({
        isRecording: false,
        recordTip: "按住录制",
        recordState: 0,
      })
    },

    /**
     * 录音按钮按下事件
     */
    handleTouchStart (e) {
      // 探测录音进行中时禁用交互，避免并发竞态
      if (isProbeRunning) {
        return
      }
      // 标记用户按下了按钮
      isTouchDown = true

      // 如果操作未完成或已经在录音中，直接返回
      if (!isOperationComplete || this.data.isRecording) {
        return
      }

      // 标记操作开始，锁定按钮
      isOperationComplete = false

      // 确保录音管理器已初始化
      if (!recorderManager) {
        this.initRecorderManager()
      }

      startY = e.touches[0].clientY
      isCancel = false
      isStartPending = true
      hasStartedNativeRecord = false

      this.setData({
        recordTip: "松手创建，上移取消",
        isRecording: true,
        recordState: 1,
      })

      // 重置超时标志
      isRecordingTimeout = false
      this.clearStartRecordTimer()
      startRecordTimer = setTimeout(() => {
        if (!isTouchDown || isCancel || !isStartPending) {
          return
        }
        // 录音参数固定不可更改
        try {
          recorderManager.start({
            duration: 10000,
            sampleRate: 24000,
            format: "PCM",
            numberOfChannels: 1,
            frameSize: 50, // 启用帧数据回调，每50ms回调一次
          })
        } catch (e) {
          this.resetRecordingState()
          this.triggerEvent("titleReset")
          isStartPending = false
          hasStartedNativeRecord = false
          isCancel = false
          isOperationComplete = true
        }
      }, START_RECORD_DELAY)
    },

    /**
     * 录音按钮取消事件
     */
    handleTouchCancel () {
      // 手指意外离开屏幕，取消录音
      isTouchDown = false
      isCancel = true
      this.clearStartRecordTimer()
      // 如果处于录音中，需要停止录音以触发统一复位逻辑
      if ((isStartPending || hasStartedNativeRecord || this.data.isRecording) && recorderManager) {
        recorderManager.stop()
      }

      if (!hasStartedNativeRecord) {
        this.resetRecordingState()
        this.triggerEvent("titleReset")
        this.notifyCancelToast()
      }

      isStartPending = false
      hasStartedNativeRecord = false
      isOperationComplete = true
    },

    /**
     * 关闭弹窗
     */
    closePopup () {
      // 关闭弹窗同时进行清理，防止旧状态残留
      this.cleanupRecorder() + // 同步关闭语言选择弹窗
        +this.setData({ showChangeLangDialog: false })
      this.triggerEvent("close")
    },

    /**
     * 下一步按钮点击
     */
    toNextStep () {
      this.triggerEvent("nextStep")
    },

    /**
     * 打开语言选择弹窗
     */
    openChangeLangDialog () {
      this.setData({
        showChangeLangDialog: true,
      })
    },

    /**
     * 切换语言
     */
    changLang (e) {
      const langType = e.currentTarget.dataset.content
      this.triggerEvent("langChange", { langType })
      this.setData({
        showChangeLangDialog: false,
      })
    },

    /**
     * 关闭语言选择弹窗
     */
    closeChangeLangDialog () {
      this.setData({
        showChangeLangDialog: false,
      })
    },
    /**
     * 音量计算
     */
    calculateVolume (frameBuffer) {
      const dataView = new DataView(frameBuffer)
      const length = dataView.byteLength / 2
      let sum = 0
      for (let i = 0; i < length; i++) {
        const sample = dataView.getInt16(i * 2, true)
        sum += sample * sample
      }
      const rms = Math.sqrt(sum / length)
      if (rms === 0) return -96 // 静音时返回一个很低的分贝值
      return 20 * Math.log10(rms / 32768)
    },

    /**
     * 环境噪音检测
     */
    // isEnvironmentNoisy (volumeData) {
    //   if (!volumeData.length) return false
    //   const avgVolume =
    //     volumeData.reduce((sum, vol) => sum + vol, 0) / volumeData.length
    //   const variance =
    //     volumeData.reduce((sum, vol) => sum + Math.pow(vol - avgVolume, 2), 0) /
    //     volumeData.length
    //   // 使用统一的阈值，并调整方差阈值
    //   return avgVolume > NOISE_THRESHOLD || variance > 25 // 降低方差阈值
    // },

    /**
     * 录音按钮移动事件
     */
    handleTouchMove (e) {
      // 探测录音进行中时禁用交互
      if (isProbeRunning) {
        return
      }
      // 只有在按钮被按下且录音状态下才处理移动
      if (!isTouchDown || !this.data.isRecording) {
        return
      }

      const moveY = e.touches[0].clientY
      const deltaY = startY - moveY

      if (deltaY > 50) {
        // 上滑超过阈值，标记为取消
        isCancel = true
        this.setData({
          recordTip: "松手取消",
          recordState: 2,
        })
      } else {
        isCancel = false
        this.setData({
          recordTip: "松手创建，上移取消",
          recordState: 1,
        })
      }
    },

    /**
     * 录音按钮抬起事件
     */
    handleTouchEnd () {
      // 探测录音期间忽略抬起事件
      if (isProbeRunning) {
        return
      }
      // 标记用户抬起了手指
      isTouchDown = false

      // 快速点击松开：按交互逻辑执行取消，不触发后台录音
      if (isStartPending && !hasStartedNativeRecord) {
        isCancel = true
        this.clearStartRecordTimer()
        if (recorderManager) {
          try {
            recorderManager.stop()
          } catch (e) { }
        }
        this.resetRecordingState()
        this.triggerEvent("titleReset")
        this.notifyCancelToast()
        isStartPending = false
        hasStartedNativeRecord = false
        isOperationComplete = true
        return
      }

      if (this.data.isRecording && hasStartedNativeRecord) {
        if (isCancel) {
          console.log("取消录音")
        }
        // 停止录音，onStop监听器会自动处理状态重置和上传逻辑
        if (recorderManager) {
          recorderManager.stop()
        }
      } else {
        // 如果不在录音状态，立即解锁按钮并重置状态
        isOperationComplete = true

        // 强制重置状态确保一致性
        this.setData({
          recordTip: "按住录制",
          recordState: 0,
        })

        // 触发标题重置事件
        this.triggerEvent("titleReset")

        // 重置取消标志
        isCancel = false
        isStartPending = false
        hasStartedNativeRecord = false
        return
      }

      // 这里不设置 isOperationComplete = true，避免竞态条件
      // 如果不在录音状态但按钮状态异常，强制重置状态
      if (
        !this.data.isRecording &&
        (this.data.recordState !== 0 || this.data.recordTip !== "按住录制")
      ) {
        this.setData({
          recordTip: "按住录制",
          recordState: 0,
        })
        // 触发标题重置事件
        this.triggerEvent("titleReset")
        // 重置取消标志
        isCancel = false
        // 确保操作完成标志被设置
        isOperationComplete = true
      }
    },
  },
})

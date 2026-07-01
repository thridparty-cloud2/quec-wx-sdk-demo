import riskConst from "../../../js/riskConst.js"
const plugin = requirePlugin("quecPlugin")
import eventBus from "../../../../common/eventBus.js"

let playAudioObj = undefined
Page({
  /**
   * 页面的初始数据
   */
  data: {
    curDevice: {},
    role: {},
    riskConst: riskConst,
    gradientHeight: 20,
    listHei: 400,
    riskId: "",
    detailObj: {},
    isRecording: false,
    scrollId: "",
    isScrollAnimation: false,
    backUrl: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let self = this
    self.setData({
      gradientHeight: (220 / wx.getWindowInfo().windowHeight).toFixed(2) * 100,
      listHei: wx.getWindowInfo().windowHeight - 100 - 370 - 90,
    })

    if (options.item) {
      self.setData({
        curDevice: JSON.parse(decodeURIComponent(options.item)),
      })
    }

    if (options.role) {
      self.setData({
        role: JSON.parse(decodeURIComponent(options.role)),
      })
    }

    if (options.riskId) {
      self.setData({
        riskId: Number(options.riskId),
      })

      self.getDetail(self.data.riskId)
    }

    if (options.backToList) {
      self.setData({
        backUrl:
          "/panel/toy/module/risk/list/index?item=" +
          encodeURIComponent(JSON.stringify(self.data.curDevice)) +
          "&role=" +
          encodeURIComponent(JSON.stringify(self.data.role)),
      })
    }

    // 获取设备实时在线状态
    eventBus.on("wsAiDstatus", (status) => {
      console.log("%c[WS] 设备状态", "color:green", status)
      let { curDevice } = self.data
      curDevice.onlineStatus = status
      self.setData({
        curDevice,
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 获取风险预警详情
   */
  getDetail(riskId, enableAnimation = false) {
    let self = this
    let idToUse = riskId || self.data.riskId

    plugin.ai.chatWarnDetail({
      id: idToUse,
      success(res) {
        console.log("风险预警详情", res)
        let detailObj = res.data
        detailObj.parentGuideList.forEach((r) => {
          r.play = false
          r.createTimeFmt = plugin.jsUtil.formatDate(
            new Date(r.createTime),
            "MM月dd日 hh:mm",
          )
        })
        self.setData(
          {
            detailObj,
            isScrollAnimation: enableAnimation,
          },
          () => {
            self.setData({
              scrollId: `item${detailObj.parentGuideList.length - 1}`,
            })
          },
        )
      },
      fail(err) {
        console.error("getDetail fail", err)
      },
    })
  },

  /**
   * 播音频文件
   * @param {*} e
   */
  boEv(e) {
    let self = this
    let item = e.currentTarget.dataset.item
    let { detailObj } = self.data
    const isPlaying = detailObj.parentGuideList.some((r) => r.id === item.id && r.play)
    self.destroyVoice()

    if (isPlaying) {
      return
    }

    detailObj.parentGuideList.forEach((r) => {
      r.play = r.id == item.id ? true : false
    })
    self.setData({
      detailObj,
    })

    if (playAudioObj == undefined) {
      playAudioObj = wx.createInnerAudioContext({
        useWebAudioImplement: false,
      })
      playAudioObj.src = item.voiceFileUrl
      playAudioObj.play() // 播放
      playAudioObj.onEnded(() => {
        console.log("播放完成")
        let { detailObj } = self.data
        detailObj.parentGuideList.forEach((r) => {
          r.play = false
        })
        self.setData({
          detailObj,
        })
      })
    }
  },

  /**
   * 释放音频资源
   */
  destroyVoice() {
    let self = this
    let { detailObj } = self.data
    if (playAudioObj !== undefined) {
      playAudioObj.stop()
      playAudioObj.destroy() // 释放音频资源
      playAudioObj = undefined
      detailObj.parentGuideList.forEach((r) => {
        r.play = false
      })
      self.setData({
        detailObj,
      })
    }
  },

  /**
   * 查看聊天
   */
  goChat(e) {
    let { curDevice, detailObj } = this.data
    console.log("curDevice:", curDevice)

    this.pageRouter.navigateTo({
      url: `/panel/toy/module/chat/index/index?eUid=${encodeURIComponent(
        JSON.stringify(curDevice.uid),
      )}&item=${encodeURIComponent(JSON.stringify(curDevice))}&role=${encodeURIComponent(
        JSON.stringify(detailObj),
      )}`,
    })
  },

  /**
   * 监听录音状态变化
   */
  onRecordStateChange(e) {
    this.setData({
      isRecording: e.detail.isRecording,
    })
  },

  /**
   * 处理录音结果
   */
  getRecordResult(res) {
    let self = this
    console.log("getRecordResult:")
    let detail = res.detail
    console.log(detail)
    plugin.jsUtil.load(3000)
    plugin.ai.pcmToMp3({
      file: detail.tempFilePath,
      success(result) {
        console.log("pcmToMp3:dnfkdnfkdsn")
        console.log(result)
        if (result.statusCode == 200) {
          let rdata = JSON.parse(result.data)
          let filePath = rdata.data
          self.uploadVoice(filePath, detail.duration)
        }
      },
      fail(res) {},
      complete(res) {},
    })
  },

  /**
   * 发送录音
   */
  uploadVoice(filePath, duration) {
    let self = this
    let { curDevice } = self.data
    plugin.ai.uploadGuideVoice({
      id: self.data.riskId,
      productKey: curDevice.productKey,
      deviceKey: curDevice.deviceKey,
      endUserId: curDevice.shareCode ? curDevice.ownerUid : curDevice.uid,
      voiceFileUrl: filePath,
      voiceTime: duration,
      success(res) {
        console.log(res)
        plugin.jsUtil.hideTip()
        plugin.jsUtil.tip("发送成功")
        let pages = getCurrentPages()
        if (pages.length > 1) {
          let prePage = pages[pages.length - 2]
          console.log(self.data.detailObj.status)
          if (!self.data.detailObj.status) {
            prePage.setData({
              needRefresh: true,
            })
          }
        }
        plugin.jsUtil.delayCb(() => {
          self.getDetail(null, true)
        }, 1000)
      },
      fail(res) {},
    })
  },

  /**
   * 重发
   */
  reSend(e) {
    let self = this
    if (self.data.curDevice.onlineStatus !== 1) {
      wx.showToast({
        title: "设备离线，请稍后再试",
        icon: "none",
      })
      return
    }
    let item = e.currentTarget.dataset.item
    let { curDevice } = self.data
    plugin.ai.chatWarnResend({
      id: item.id,
      productKey: curDevice.productKey,
      deviceKey: curDevice.deviceKey,
      success(res) {
        console.log(res)
        self.getDetail(null, true)
      },
      fail(res) {},
      complete(res) {},
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.destroyVoice()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.destroyVoice()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
})

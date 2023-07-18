const plugin = requirePlugin('quecPlugin')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pk: '',
    dk: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let self = this
    if (options.item) {
      let dItem = JSON.parse(decodeURIComponent(options.item))
      console.log(dItem)
      self.setData({
        pk: dItem.productKey,
        dk: dItem.deviceKey,
        curDevice: JSON.stringify(dItem),
      })

      //示例调用
      // console.log('获取物模型所有属性：')
      // plugin.quecManage.getTslList({
      //   pk: this.data.pk,
      //   success (res) {
      //     console.log(res)
      //   },
      //   fail (res) {
      //     console.log(JSON.stringify(res))
      //   }
      // })

      // console.log('获取有值的物模型属性及对应的值：')
      // plugin.quecManage.getTslVal({
      //   pk: this.data.pk,
      //   dk: this.data.dk,
      //   success (res) {
      //     console.log(res)
      //   },
      //   fail (res) {
      //     console.log(JSON.stringify(res))
      //   }
      // })



      /**
       * websocket 示例调用
       */
      plugin.webSocket.connectSocket()
      self.msgCb()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {

  },

  msgCb () {
    let self = this
    let subscribeDeviceKey = self.data.dk
    let subscribeProductKey = self.data.pk
    plugin.webSocket.msgCallback((res) => {
      if (res) {
        let parm = JSON.parse(res)
        if (parm.cmd === 'login_resp') {//登录
          // 登录回调
          if (parm.data.code === 1) {
            console.log('WebSocket 登录成功')
            // 登录完成后，进行设备订阅
            if (subscribeDeviceKey && subscribeProductKey) {
              let data = {
                pk: subscribeProductKey,
                dk: subscribeDeviceKey
              }
              plugin.webSocket.subscribeDevice(data)
            }
          } else {
            console.log('WebSocket  登录失败')
          }
        } else if (parm.cmd === 'subscribe_resp') {//订阅响应
          // 订阅响应回调
          console.log('WebSocket 订阅响应成功')
          if (parm.data && parm.data.length > 0) {
            if (parm.data[0].code === '4011') {
              wx.showToast('设备未绑定')
            }
          }
        } else if (parm.cmd === 'unsubscribe_resp') {//取消订阅
          // 取消订阅响应回调
          console.log('WebSocket  取消 订阅 成功')
          //清除订阅信息
          subscribeDeviceKey = ''
          subscribeProductKey = ''
        } else if (parm.cmd === 'send_ack') {//发送指令应答
          // 发送指令响应
          console.log('WebSocket  发送指令响应 应答', parm.data)
          if (parm.data.status == 'succ') {
            wx.showToast('发送成功', 'success')
          } else {
            setTimeout(() => {
              wx.showToast('发送失败', 'error')
            }, 300)
          }
        } else if (parm.cmd === 'message') {
          //更新广播
          if (parm.data.type === undefined) {
            try {
              parm.data = JSON.parse(parm.data)
            } catch (e) {
              console.log(e)
            }
          }
          if (parm.data.type === 'MATTR') {//设备上报属性信息
            let reportData = parm.data.data.kv
            console.log(reportData)
          } else if (parm.data.type === 'ENDUSER' && parm.data.subtype === 'USER-BIND') {
            wx.showToast('设备已失效')
          }
        } else if (parm.cmd === 'error') { //错误信息
          console.log('WebSocket   错误信息' + parm.data.msg)
        }
      }
    })
  },

  send () {
    let self = this
    let pk = self.data.pk
    let dk = self.data.dk
    let type = 'WRITE-ATTR'
    let sendData = [{
      id: 43,
      value: 5,
      type: "INT"
    }]
    plugin.webSocket.sendCmd({ pk, dk, type, sendData })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {

  }
})
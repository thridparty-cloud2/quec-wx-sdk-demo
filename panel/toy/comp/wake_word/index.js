const plugin = requirePlugin("quecPlugin")
import { toPinyin } from "./pinyin.js"
import { getWakeWordName } from "../../js/common.js"

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
    wakeWordObj: {
      type: Object,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    inputVal: "",
  },
  pageLifetimes: {},
  lifetimes: {
    ready () {
      // 组件初始化，唤醒词数据回显
      this.setData({
        inputVal: getWakeWordName(this.properties.wakeWordObj),
      })
    },
  },
  observers: {
    wakeWordObj (newWakeWordObj) {
      // 监听wakeWordObj变化，更新输入框值
      if (newWakeWordObj) {
        const newInputVal = getWakeWordName(newWakeWordObj)
        this.setData({
          inputVal: newInputVal,
        })
      }
      console.log("wakeWordObj", newWakeWordObj)
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 模式修改
     */
    onConfirm (e) {
      let self = this
      let { curItem } = self.properties
      let { inputVal } = self.data

      if (
        curItem?.productKey === undefined ||
        curItem?.deviceKey === undefined
      ) {
        return
      }

      // 校验唤醒词不能为空
      if (!inputVal || inputVal.trim() === "") {
        wx.showToast({
          title: "请输入唤醒词",
          icon: "none",
          duration: 2000,
        })
        return
      }

      // 校验唤醒词只能包含中文字符
      const chineseRegex = /^[\u4e00-\u9fa5]+$/
      if (!chineseRegex.test(inputVal.trim())) {
        wx.showToast({
          title: "唤醒词仅支持中文",
          icon: "none",
          duration: 2000,
        })
        return
      }

      wx.nextTick(() => {
        let pk = curItem.productKey
        let dk = curItem.deviceKey
        const execText = "_" + toPinyin(inputVal).join("_")
        let sendData = [
          {
            [self.data.wakeWordObj.code]: [
              {
                0: [{ displayText: inputVal }, { executableText: execText }],
              },
            ],
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
            self.onClose()
            plugin.ai.agentParamConfig({
              deviceKey: dk,
              productKey: pk,
              configParams: [
                {
                  type: "wakeWord", //wakeWord-唤醒词/chatModeSt-聊天模式,
                  data: inputVal,
                  execText,
                },
              ],
              success (res) { },
              fail (res) { },
              complete (res) { },
            })
          },
          fail (res) { },
        })
      })
    },

    onInputChange (e) {
      this.setData({
        inputVal: e.detail.value,
      })
    },
    onClose () {
      // 关闭对话框，重置输入框内容为已保存值
      const resetVal = getWakeWordName(this.properties.wakeWordObj)
      this.setData({ inputVal: resetVal })
      // 可以传递任意 detail
      this.triggerEvent("closeWakeWordHandleVisible", { reason: "userClick" })
    },
  },
})

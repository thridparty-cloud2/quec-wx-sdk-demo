const plugin = requirePlugin("quecPlugin");
import { home } from "../../../../utils/jump.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    renameVisible: false,
    i18n: "",
    skin: "",
    curItem: {},
    argsItem: {},
    defaultImg:
      plugin.main.getBaseImgUrl() + "images/device/device_default.png",
    role: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let self = this;
    self.setData({
      i18n: plugin.main.getLang(),
      skin: plugin.main.getSkin(),
    });
    if (options.item) {
      self.setData({
        argsItem: JSON.parse(decodeURIComponent(options.item)),
      });
    }

    if (JSON.stringify(self.data.argsItem) !== "{}") {
      self.initRole();
      self.getDeviceInfo();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  renameSucc() {
    this.setData({
      renameVisible: false,
    });
    wx.nextTick(() => {
      home(this);
    });
  },

  /**
   * 初始化权限
   */
  initRole() {
    let self = this;
    plugin.core.getMode({
      success(res) {
        if (res.data.enabledFamilyMode) {
          plugin.core.getFid({
            success(res) {
              self.setData({
                role: Number(res.memberRole),
              });
            },
          });
        } else {
          self.setData({
            role: "",
          });
        }
      },
      fail(res) {},
      complete(res) {},
    });
  },

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    let self = this;
    let { argsItem } = self.data;
    plugin.quecManage.deviceInfo({
      pk: argsItem.productKey,
      dk: argsItem.deviceKey,
      success(res) {
        if (res.data) {
          self.setData({
            curItem: res.data,
          });
        }
      },
    });
  },

  onCopy(e) {
    let text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text,
      success: function (res) {
        wx.showToast({
          title: "复制成功",
        });
      },
    });
  },

  rename() {
    this.setData({
      renameVisible: true,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

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
});

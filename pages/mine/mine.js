import { jump } from "../../utils/jump.js";
import resourceKeys from "../../utils/constant.js";
import { getDifLang } from "../../utils/dLang.js";

const plugin = requirePlugin("quecPlugin");
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    headImage: "",
    nikeName: "",
    phonenumber: "",
    email: "",
    baseImgUrl: app.globalData.baseImgUrl,
    isFinish: false,
    isToken: false,
    env: app.globalData.envData,
    valaddTxt: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let diff = getDifLang();
    let valTxt = {
      telTit: diff["valadd"].telTit,
      more: diff["valadd"].more,
      smsTit: diff["valadd"].smsTit,
      serTit: diff["valadd"].serTit,
      set: diff["valadd"].set,
    };
    this.setData({
      valaddTxt: valTxt,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this;
    let { env } = self.data;
    if (typeof self.getTabBar === "function" && self.getTabBar()) {
      self.setData({
        isToken: plugin.config.getToken(),
      });
      if (plugin.config.getToken()) {
        self.initUinfo();
      } else {
        let imgs = plugin.config.getHeadImg(false);
        self.setData({
          headImage: imgs[0],
        });
      }
      wx.nextTick(() => {
        // Demo: 固定2个Tab，选中索引为1
        self.getTabBar().setData({
          selected: 1,
        });
      });
    }
  },

  initUinfo() {
    plugin.jsUtil.load(2000);
    let self = this;
    plugin.quecUser.getUInfo({
      success(res) {
        let result = res.data;
        let hImg = result.headimg;
        let imgs = plugin.config.getHeadImg(false);
        if (imgs.indexOf(hImg) < 0) {
          hImg = imgs[0];
        }
        self.setData({
          headImage: hImg,
        });
        self.setData({
          nikeName: result.nikeName ? result.nikeName : "",
        });
      },
      fail(res) {},
      complete() {
        wx.hideToast();
        self.setData({
          isFinish: true,
        });
      },
    });
  },

  /**
   * 个人中心
   */
  goUserInfo() {
    let self = this;
    if (self.data.isToken) {
      self.pageRouter.navigateTo({
        url: "/user/info/index",
      });
    } else {
      jump(self);
    }
  },
  /**
   * 关于我们
   */
  goUserAbout() {
    let self = this;
    this.pageRouter.navigateTo({
      url: "/user/about/" + self.data.env["about"] + "/home/index",
    });
  },
  /**
   * 系统设置
   */
  goSetting() {
    this.pageRouter.navigateTo({
      url: "/user/setting/index",
    });
  },

  /**
   * 消息中心
   */
  goMsg() {
    let self = this;
    if (self.data.isToken) {
      self.pageRouter.navigateTo({
        url: "/user/msg/index",
      });
    } else {
      jump(self);
    }
  },

  /**
   * 意见反馈
   */
  goFeedback() {
    // Demo: feedback 页面已移除
  },

  /**
   * 帮助文档
   */
  goHelp() {
    // Demo: help 页面已移除
  },

  /**
   * 电话推送
   */
  goTel() {
    // Demo: valadd 已移除
  },

  /**
   * 电话推送
   */
  goSms() {
    // Demo: valadd 已移除
  },

  verifyToken() {
    if (!this.data.isToken) {
      this.pageRouter.navigateTo({
        url: "/user/index/index",
      });
      return false;
    }
    return true;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});

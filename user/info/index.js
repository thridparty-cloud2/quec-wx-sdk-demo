import { home, jump } from "../../utils/jump.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    phoneVisible: false,
    phoneInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  goNikeName(e) {
    wx.redirectTo({
      url: "/user/nickname/index?nikeName=" + e.detail,
    });
  },

  logoutSuccess() {
    home(this);
  },

  goChangePwd(e) {
    this.pageRouter.navigateTo({
      url: "/user/edit_pwd/index?uname=" + e.detail,
    });
  },

  /**手机号授权 */
  relatePhone() {
    this.setData({
      phoneVisible: true,
    });
  },

  getPhoneInfo(e) {
    this.setData({
      phoneInfo: e.detail,
    });
  },

  jump() {
    jump(this);
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
});

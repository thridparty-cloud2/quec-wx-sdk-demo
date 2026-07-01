/**
 * 麦克风权限检查工具
 */
class MicAuth {
  /**
   * 检查麦克风权限
   * @returns {Promise<boolean>} 返回是否有麦克风权限
   */
  static checkMicAuth() {
    return new Promise((resolve) => {
      wx.getSetting({
        success(res) {
          if (!res.authSetting["scope.record"]) {
            wx.authorize({
              scope: "scope.record",
              success() {
                console.log("已授权录音");
                resolve(true);
              },
              fail() {
                console.log("未授权录音");
                resolve(false);
              },
            });
          } else {
            // 已授权
            resolve(true);
          }
        },
      });
    });
  }

  /**
   * 显示权限设置提示弹窗
   * @param {string} confirmText 确认按钮文本，默认为"去设置"
   */
  static showPermissionModal(confirmText = "去设置") {
    wx.showModal({
      title: "提示",
      content: "请开启麦克风权限",
      confirmText: confirmText,
      success: (res) => {
        if (res.confirm) {
          // 这个 confirm 回调是用户点击触发的，可以安全调用 openSetting
          wx.openSetting();
        }
      },
    });
  }
}

module.exports = MicAuth;

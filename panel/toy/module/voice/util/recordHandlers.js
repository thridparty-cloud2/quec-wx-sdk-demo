/**
 * 录音事件处理工具类
 */
class RecordHandlers {
  /**
   * 录音开始处理
   * @param {Object} context 页面上下文
   * @param {string} titleField 标题字段名，默认为录音弹窗标题字段
   */
  static onRecordStart(context, titleField = "voicePrintPopupTitle") {
    console.log("录音开始");
    // 更新弹窗标题为录音中状态
    const setDataObj = {};
    setDataObj[titleField] = "录音中，请朗读";
    context.setData(setDataObj);
  }

  /**
   * 录音完成处理
   * @param {Object} e 录音完成事件对象
   * @param {Function} uploadCallback 上传回调函数
   */
  static onRecordComplete(e, uploadCallback) {
    const { tempFilePath, duration } = e.detail;
    console.log("录音完成", tempFilePath, duration);

    // 调用上传回调函数
    if (typeof uploadCallback === "function") {
      uploadCallback(tempFilePath, duration);
    }
  }

  /**
   * 重置录音标题
   * @param {Object} context 页面上下文
   * @param {string} titleField 标题字段名
   * @param {string} defaultTitle 默认标题文本
   */
  static onRecordTitleReset(
    context,
    titleField = "voicePrintPopupTitle",
    defaultTitle = "请朗读"
  ) {
    const setDataObj = {};
    setDataObj[titleField] = defaultTitle;
    context.setData(setDataObj);
  }

  /**
   * 设置录音上传状态
   * @param {Object} context 页面上下文
   * @param {string} titleField 标题字段名
   * @param {string} message 状态消息
   */
  static setUploadStatus(context, titleField, message) {
    const setDataObj = {};
    setDataObj[titleField] = message;
    context.setData(setDataObj);
  }

  /**
   * 处理录音上传错误
   * @param {Object} context 页面上下文
   * @param {string} titleField 标题字段名
   * @param {Object} res 错误响应对象
   * @param {string} defaultErrorMsg 默认错误消息
   */
  static handleUploadError(
    context,
    titleField,
    res,
    defaultErrorMsg = "录音文件上传失败"
  ) {
    let errorMsg = defaultErrorMsg;

    // 安全地解析返回数据
    if (res.data && typeof res.data === "string") {
      try {
        let resData = JSON.parse(res.data);
        errorMsg = resData.msg || errorMsg;
      } catch (e) {
        console.log("解析返回数据失败", e);
      }
    }

    const setDataObj = {};
    setDataObj[titleField] = errorMsg;
    context.setData(setDataObj);
  }
}

module.exports = RecordHandlers;

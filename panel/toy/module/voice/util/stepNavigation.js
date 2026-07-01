const MicAuth = require('./micAuth');

/**
 * 步骤导航工具类
 * 处理录音弹窗的步骤切换逻辑
 */
class StepNavigation {
  /**
   * 处理下一步逻辑
   * @param {Object} context 页面上下文
   * @param {Object} config 配置对象
   * @param {string} config.stepField 步骤字段名
   * @param {string} config.titleField 标题字段名
   * @param {string} config.confirmText 权限弹窗确认按钮文本
   */
  static handleNextStep(context, config = {}) {
    const {
      stepField = 'voicePrintStep',
      titleField = 'voicePrintPopupTitle',
      confirmText = '确定'
    } = config;

    const currentStep = context.data[stepField];

    if (currentStep === 0) {
      // 再次检查录音权限
      MicAuth.checkMicAuth().then((hasAuth) => {
        if (hasAuth) {
          const setDataObj = {};
          setDataObj[titleField] = "注意事项";
          setDataObj[stepField] = currentStep + 1;
          context.setData(setDataObj);
        } else {
          console.log("进入设置页设置mic权限");
          MicAuth.showPermissionModal(confirmText);
        }
      });
    } else if (currentStep === 1) {
      const setDataObj = {};
      setDataObj[titleField] = "请朗读";
      setDataObj[stepField] = currentStep + 1;
      context.setData(setDataObj);
    }
  }

  /**
   * 重置步骤到初始状态
   * @param {Object} context 页面上下文
   * @param {Object} config 配置对象
   */
  static resetStep(context, config = {}) {
    const {
      stepField = 'voicePrintStep',
      titleField = 'voicePrintPopupTitle',
      initialStep = 0,
      initialTitle = '注意事项'
    } = config;

    const setDataObj = {};
    setDataObj[stepField] = initialStep;
    setDataObj[titleField] = initialTitle;
    context.setData(setDataObj);
  }

  /**
   * 打开录音弹窗
   * @param {Object} context 页面上下文
   * @param {Object} config 配置对象
   */
  static openRecordPopup(context, config = {}) {
    const {
      popupField = 'showVoicePrintPopup',
      stepField = 'voicePrintStep',
      titleField = 'voicePrintPopupTitle',
      additionalFields = {}
    } = config;

    // 检查麦克风权限
    MicAuth.checkMicAuth().then((hasAuth) => {
      const setDataObj = {
        [popupField]: true,
        [stepField]: hasAuth ? 1 : 0,
        [titleField]: "注意事项",
        ...additionalFields
      };
      context.setData(setDataObj);
    });
  }

  /**
   * 关闭录音弹窗
   * @param {Object} context 页面上下文
   * @param {Object} config 配置对象
   */
  static closeRecordPopup(context, config = {}) {
    const {
      popupField = 'showVoicePrintPopup',
      stepField = 'voicePrintStep',
      titleField = 'voicePrintPopupTitle',
      resetFields = {}
    } = config;

    // 分离 langType 和其他重置字段
    const { langType, ...otherResetFields } = resetFields;

    // 立即关闭弹窗和重置其他字段
    const immediateSetDataObj = {
      [popupField]: false,
      ...otherResetFields
    };
    context.setData(immediateSetDataObj);

    // 延迟300ms重置步骤和langType，等待弹窗关闭动画完成
    setTimeout(() => {
      MicAuth.checkMicAuth().then((hasAuth) => {
        const delayedSetDataObj = {
          [stepField]: hasAuth ? 1 : 0,
          [titleField]: hasAuth ? "注意事项" : ""
        };
        
        // 如果有 langType 需要重置，添加到延迟执行的数据中
        if (langType !== undefined) {
          delayedSetDataObj.langType = langType;
        }
        
        context.setData(delayedSetDataObj);
      });
    }, 300);
  }


}

module.exports = StepNavigation;
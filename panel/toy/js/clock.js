// clock工具函数
const ClockUtils = {
  /**
   * 格式化重复日期
   * @param {string} dayOfWeek - 逗号分隔的星期数字字符串
   * @param {string} [type] - 闹钟类型，可选：once / custom-repeat / day-repeat
   * @returns {string} 格式化后的重复日期文本
   */
  formatRepeat(dayOfWeek, type) {
    // day-repeat 类型直接返回"每天"，无需 dayOfWeek
    if (type === "day-repeat") return "每天"

    if (!dayOfWeek || dayOfWeek === "") return "仅一次"
    if (dayOfWeek === "once") return "仅一次"

    const days = dayOfWeek.split(",")
    if (days.length === 7) {
      return "每天"
    }

    const map = {
      once: "仅一次",
      1: "周一",
      2: "周二",
      3: "周三",
      4: "周四",
      5: "周五",
      6: "周六",
      7: "周日",
    }
    return dayOfWeek
      .split(",")
      .map((d) => map[d])
      .join("、")
  },

  /**
   * 格式化时间
   * @param {string} time - 时间字符串 (HH:mm:ss)
   * @returns {string} 格式化后的时间字符串 (HH:mm)
   */
  formatTime(time) {
    if (!time) return "--:--"
    const parts = time.split(":")
    const hour = parts[0] || "00"
    const minute = parts[1] || "00"
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
  },

  /**
   * 解析重复日期文本
   * @param {string} repeatText - 重复日期文本
   * @returns {string} 逗号分隔的星期数字字符串
   */
  parseRepeat(repeatText) {
    if (!repeatText || repeatText === "仅一次") return "once"
    if (repeatText === "每天") return "1,2,3,4,5,6,7"
    const reverseMap = {
      周一: "1",
      周二: "2",
      周三: "3",
      周四: "4",
      周五: "5",
      周六: "6",
      周日: "7",
    }
    return repeatText
      .split("、")
      .map((day) => reverseMap[day])
      .filter((num) => num) // 过滤掉无效值
      .join(",")
  },

  /**
   * 解析铃声URL并获取对应的铃声名称
   * @param {string} actionStr - JSON字符串格式的action数据
   * @returns {string} 对应的铃声名称
   */
  parseRingtoneName(actionStr) {
    if (!actionStr) return ""

    try {
      // 解析JSON字符串
      const actionData = JSON.parse(actionStr)
      const ringtoneUrl = actionData[0]?.value || ""

      // 铃声URL与名称的映射表
      const ringtoneMap = {
        "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock1.mp3": "铃声一",
        "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock2.mp3": "铃声二",
        "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock3.mp3": "铃声三",
        "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock4.mp3": "铃声四",
        "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock5.mp3": "铃声五",
      }

      return ringtoneMap[ringtoneUrl.trim()] || "自定义铃声"
    } catch (error) {
      return ""
    }
  },

  /**
   * 根据铃声名称获取对应的URL
   * @param {string} ringtoneName - 铃声名称
   * @returns {string} 铃声URL
   */
  formatRingtoneUrl(ringtoneName) {
    if (!ringtoneName) return ""

    const nameToUrlMap = {
      铃声一: "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock1.mp3",
      铃声二: "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock2.mp3",
      铃声三: "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock3.mp3",
      铃声四: "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock4.mp3",
      铃声五: "https://iot-oss.quectelcn.com/wxsdk_img/ai/new/clock/clock5.mp3",
    }

    const ringtoneUrl = nameToUrlMap[ringtoneName.trim()]
    if (!ringtoneUrl) {
      return ""
    }

    return ringtoneUrl
  },
}

module.exports = ClockUtils

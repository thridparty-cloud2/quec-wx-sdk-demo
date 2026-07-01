const NUMBERED_RE = /^\d+\./

/**
 * 处理文字内容数组，识别带序号和不带序号的消息，并标记最后一个带序号的消息
 * @param {Array} contents - 内容数组
 * @returns {Array}
 */
function processContents(contents) {
  let hasNumbered = false
  let hasUnnumbered = false
  let lastNumberedIndex = -1

  // 单次遍历：同时检测混合类型 & 记录最后一个带序号的位置
  for (let i = 0; i < contents.length; i++) {
    if (NUMBERED_RE.test(contents[i].trim())) {
      hasNumbered = true
      lastNumberedIndex = i
    } else {
      hasUnnumbered = true
    }
  }

  // 仅在混合类型时才需要标记 lastNumbered
  const isMixed = hasNumbered && hasUnnumbered

  return contents.map((content, index) => ({
    text: content,
    isNumbered: NUMBERED_RE.test(content.trim()),
    isLastNumbered: isMixed && index === lastNumberedIndex,
  }))
}

module.exports = {
  processContents,
}

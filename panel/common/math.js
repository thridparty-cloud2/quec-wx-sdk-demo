/**
 * 获取小数精度
 * @param {string} step DMP设置的step字段
 * @param {number} customDigits 自定义精度，优先级更高
 * @returns 
 */
export function getDigits (step, customDigits) {
  if (customDigits) {
    return customDigits
  }

  let digit = 0
  try {
    const indexDot = step.lastIndexOf('.')
    if (indexDot > -1) {
      digit = indexDot > -1 ? step.substring(indexDot + 1).length : 0
    }
  } catch (error) { }
  return digit
}

/**
 * 四舍五入方法
 * @param {Number} number 目标数值
 * @param {Number} precision 精度
 * @returns 
 */
function round (number, precision) {
  return Math.round(+number + "e" + precision) / Math.pow(10, precision);
}

/**
 * 四舍五入处理小数
 * @param {Number|String} num 
 * @param {Number} precision 精度 默认0
 * @param {Boolean} sup 自动补0
 * @returns 
 */
export function getRound (num, precision, sup = true) {
  let val = Number(num)
  let value = val < 0 ? -round(-val, precision) : round(val, precision)
  return sup ? value.toFixed(precision) : value
}
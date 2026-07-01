import { jump } from '../../utils/jump.js'
const plugin = requirePlugin('quecPlugin')
// Demo: dtu.js 已移除

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isToken: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    sao () {
      let self = this
      if (plugin.config.getToken()) {
        // Demo: dtuScan 已移除
      } else {
        jump(self)
      }
    }
  }
})

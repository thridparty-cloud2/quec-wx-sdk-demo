const plugin = requirePlugin('quecPlugin')
import { toBase64 } from '/utils/tool.js'
App({
  globalData: {

  },

  onLaunch () {

  },

  onHide () {

  },

  onShow () {
    /**
   * token过期跳转到登录页面
   */
    plugin.config.setToLoginFn(() => {
      plugin.config.setUserInfo('')
      wx.redirectTo({
        url: '/pages/login/index'
      })
    })

    plugin.theme.setSkin({
      primary: 'green'
    })

    plugin.theme.setLogo(toBase64('/images/mine/headImage.png'))
    plugin.theme.setTitle('示例DEMO')

    //如客户有自己的用户域及密钥，请设置成自己的哦
    //plugin.config.setUserDomain('用户域')
    //plugin.config.setUserDomainSecret('用户域密钥')

  }
})

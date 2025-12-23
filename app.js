import { toLogin, getEnvConfig } from './utils/tool.js'
const plugin = requirePlugin('quecPlugin')
App({
  globalData: {
    baseImgUrl: 'https://iot-oss.quectelcn.com/wxsdk_img/example/',
    envData: getEnvConfig()
  },

  onLaunch () {

    plugin.config.setToLoginFn(() => {
      toLogin()
    })
  },

  onHide () {

  },

  onShow () {
    let self = this

    plugin.theme.setLogo(getEnvConfig().logo)
    plugin.theme.setTitle(getEnvConfig().title)

    /** oem主色值 */
    plugin.theme.setSkin({
      primary: self.globalData.envData['primary']
    })

    //oem用户域
    plugin.config.setUserDomain(self.globalData.envData['domain'])
    plugin.config.setUserDomainSecret(self.globalData.envData['domainSecret'])

  }
})


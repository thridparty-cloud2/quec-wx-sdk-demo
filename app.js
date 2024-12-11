import { toLogin, toHouseHome, getEnvConfig } from './utils/tool.js'
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

    plugin.config.setHouseFn(() => {
      toHouseHome()
    })
  },

  onHide () {

  },

  onShow () {
    let self = this
    // requirePlugin.async('quecPlugin').then(plugin => {
    plugin.theme.setLogo(getEnvConfig().logo)
    plugin.theme.setTitle(getEnvConfig().title)
    /** oem主色值 */
    plugin.theme.setSkin({
      primary: self.globalData.envData['primary']
    })

    //oem用户域
    plugin.config.setUserDomain(self.globalData.envData['domain'])
    plugin.config.setUserDomainSecret(self.globalData.envData['domainSecret'])

    // }).catch(({ mod, errMsg }) => {
    //   console.error(`path: ${mod}, ${errMsg}`)
    // })
  }
})


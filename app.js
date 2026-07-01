import { toLogin, toHouseHome, getEnvConfig } from "./utils/tool.js"

import QuecSaaS from '@quec-wx-mp/api-saas'
import QuecMQTT from '@quec-wx-mp/plugin-websocket-mqtt'

const plugin = requirePlugin("quecPlugin")
plugin.load(QuecSaaS)
plugin.use(QuecMQTT)

App({
  globalData: {
    baseImgUrl: "https://iot-oss.quectelcn.com/wxsdk_img/example/",
    envData: getEnvConfig(),
  },

  onLaunch () {
    console.log("onLaunch app")
    plugin.config.setToLoginFn(() => {
      toLogin()
    })
  },

  onHide () {
    this.globalData.appStatus = "back"
  },

  onShow (options) {
    let self = this
    self.globalData.appStatus = "front"

    plugin.theme.setLogo(getEnvConfig().logo)
    plugin.theme.setTitle(getEnvConfig().title)

    /** oem主色值 */
    plugin.theme.setSkin({
      primary: self.globalData.envData["primary"],
    })

    // oem用户域
    plugin.config.setUserDomain(self.globalData.envData["domain"])
    plugin.config.setUserDomainSecret(self.globalData.envData["domainSecret"])

  },
})

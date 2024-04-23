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
    //saas url
    //plugin.config.setSaasBaseUrl('https://dev-one-api.iotomp.com')
    // plugin.config.setSaasBaseUrl('https://fat-one-api.iotomp.com')
    //plugin.config.setSaasBaseUrl('https://uat-one-api.iotomp.com')

    //dev
    // plugin.config.setBaseUrl('http://192.168.25.121:29003')
    // plugin.config.setUserDomain('C.SP.YLWW')
    // plugin.config.setUserDomainSecret('7XgLrGZwN6aGnUDMVaBsJXMzCnkd4khFs2r33R4HTE7v')
    // plugin.config.setWsUrl('ws://192.168.25.64:30777/ws/v1')

    //fat2
    // plugin.config.setBaseUrl('http://fat2-api.quectelcn.com')
    // plugin.config.setUserDomain('C.DM.29772.1')
    // plugin.config.setUserDomainSecret('FPDko3tiB5HgTJhpHaUjpsYNGKbEHfjkqe2u8pB8gtKp')
    // plugin.config.setWsUrl('ws://192.168.25.64:30777/ws/v1')

    //fatg
    // plugin.config.setBaseUrl('http://fatg-iot-api.quecteleu.com')
    // plugin.config.setUserDomain('E.SP.4294967596')
    // plugin.config.setUserDomainSecret('3vqEtpmTPdxkv5hnXLneLmuJ2bvTeVRJDEJarhnpXDtW')
    // plugin.config.setWsUrl('ws://192.168.25.64:30777/ws/v1')

    // fatb
    // plugin.config.setBaseUrl('http://fatb-gateway.quectel.com')
    // plugin.config.setUserDomain('C.SP.30628')
    // plugin.config.setUserDomainSecret('6A8sVJn3fvqyjFUMfNphc3q8dEGTpYF8Afaft8Ps1k8a')
    // plugin.config.setWsUrl('ws://192.168.25.64:30777/ws/v1')

    // fatc
    // plugin.config.setBaseUrl('http://quecteltaylor.natapp1.cc')
    // plugin.config.setUserDomain('E.DM.29772.1')
    // plugin.config.setUserDomainSecret('FPDko3tiB5HgTJhpHaUjpsYNGKbEHfjkqe2u8pB8gtKp')
    // plugin.config.setWsUrl('ws://192.168.25.64:30777/ws/v1')




    // fate
    // plugin.config.setBaseUrl('http://fate-cn-iot-api.quectelcn.com')
    // plugin.config.setUserDomain('C.DM.29772.1')
    // plugin.config.setUserDomainSecret('AGfvDBFqQfLHibFr1hz1SiqRjt58DmvZQpWeSp4pPUDz')
    // plugin.config.setWsUrl('ws://192.168.29.86:30778/ws/v1')
    // plugin.config.setSaasBaseUrl('https://fat-one-api.iotomp.com')
    // SAAS接口地址baseurl修改

    // uat-cn
    // plugin.config.setBaseUrl('https://uat-iot-api.quectelcn.com')
    // plugin.config.setUserDomain('C.DM.9934.1')
    // plugin.config.setUserDomainSecret('F34vbkjQcsVpE72ZCtQUEByuHj54rLHEsHBoADtsEPHY')
    // plugin.config.setWsUrl('wss://uat-iot-ws.quectelcn.com/ws/v1')

    // plugin.config.setBaseUrl('https://uat-iot-api.quectelcn.com')
    // plugin.config.setUserDomain('C.DM.5903.1')
    // plugin.config.setUserDomainSecret('EufftRJSuWuVY7c6txzGifV9bJcfXHAFa7hXY5doXSn7')
    // plugin.config.setWsUrl('wss ://uat-iot-ws.quectelcn.com/ws/v1')


    // }).catch(({ mod, errMsg }) => {
    //   console.error(`path: ${mod}, ${errMsg}`)
    // })
  }
})


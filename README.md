微信小程序SDK使用说明

# 一、功能列表
|功能模块 | 
| -------  |  
| 用户模块 |
| 设备管理 |


# 二、快速上手
## 1、运行demo
```
1）下载微信开发者工具,下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2）下载该demo代码至本地，运行npm install
3）在微信开发者工具中导入项目-选择工具-构建npm，即可在模拟器中看到效果
```
## 2、在已有小程序中引用SDK
```
1）在您的小程序代码：app.json文件中
"plugins": {
  "quecPlugin": {
    "version": "2.3.4",
    "provider": "wx5e9a3feb8df9122e"
  }
}

2）如有自己的用户域，在app.js中请设置自己的用户域及密钥，接口如下：
const plugin = requirePlugin('quecPlugin')
plugin.config.setUserDomain('用户域')
plugin.config.setUserDomainSecret('用户域密钥')

3）授权：可将AppID和AppSecret提供给我们进行授权后，点击微信开发者工具-清缓存，然后点击“编译”即可正常运行。
```
## 3、特别说明
```
因微信官方限制,详见：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html,
建议使用企业小程序，个人小程序，手机号信息将无法获取，微信一键登录功能将不能正常使用。
其他登录方式可正常使用。
```


# 三、用户模块

## 1、功能点
```
涵盖功能点：
1、手机号/邮箱注册
2、手机号/邮箱密码登录、微信一键登录、验证码登录
3、手机号/邮箱忘记密码
4、个人信息-展示、修改头像、修改昵称、修改密码、注销账户、退出登录;
```

## 2、注册、登录、忘记密码、个人中心接口

### 1) 微信一键登录：wxLogin 

功能描述

```
微信一键登录。
```

参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| appId | string |  - | 是 | 微信appId |
| authorizedMobliePhone | boolean |  true | 是 | 是否需要用户授权手机号，默认为true |
| authorizedUserInfo | boolean |  true | 是 | 是否需要用户授权用户信息，默认为true |
| wxCode | string |  - | 是 | 微信授权Code |
| wxUserInfoDecrypData | object |  - | 否 | 微信用户信息加密信息(encryptedData、iv) |
| random | string |  - | 否 | 随机数 |
| wxPhoneDecryptData | object |  - | 否 | 手机号加密信息(encryptedData、iv) |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
第一次调用拿到random
 plugin.quecUser.wxLogin({
     appId:appId,
     authorizedMobliePhone: true,
     authorizedUserInfo: true,
     wxCode: wxCode,
     success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
 
 第二次调用，传递random，wxUserInfoDecrypData，wxPhoneDecryptData
 plugin.quecUser.wxLogin({
     appId:appId,
     authorizedMobliePhone: true,
     authorizedUserInfo: true,
     wxCode: wxCode,
     wxUserInfoDecrypData:wxUserInfoDecrypData,
     wxPhoneDecryptData:wxPhoneDecryptData,
     random:random
     success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

### 2)发送手机短信验证码：sendPhoneSmsCode

功能描述
```
发送手机短信验证码。
```

参数
| 属性   | 类型     | 默认值 | 必填 | 说明           |
| ------ | -------- | ------ | ---- | --------------|
| phone | string   | - | 是   | 手机号  |
| ssid  | string   | - |  是 | 企业短信签名ID  ('C1'-阿里云)                                            |
| stid  | string  |  - | 是 | 企业短信模板ID ( 'C1'-国内忘记密码<br>'C2'-国内登录<br>'C3'-国内注册<br> 'C7'- 国内账号注销 |
| success  | function | -  | 否   | 接口调用成功的回调函数                           |
| fail     | function | -  | 否   | 接口调用失败的回调函数                           |
| complete | function | -  | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.sendPhoneSmsCode({
    phone: '180xxxx',
    ssid: 'C1',
    stid: 'C3',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

### 3) 验证短信验证码：validateSmsCode

功能描述
```
验证短信验证码。
```

参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                             |
| ----------------- | -------- | ------ | ---- | ------------------------------------------------ |
| phone             | string   | -      | 是   | 手机号                                           |
| smsCode           | string   | -      | 是   | 短信验证码                                       |
| isDisabled        | number   |    1   | 否   | 验证码验证后是否失效，1：失效 2：不失效，默认 1   |
| success           | function | -      | 否   | 接口调用成功的回调函数                           |
| fail              | function | -      | 否   | 接口调用失败的回调函数                           |
| complete          | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.validateSmsCode({
    phone: '180xxxxx',
    smsCode: '123542',
    isDisabled:2,
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

### 5) 手机号注册:phonePwdRegister

功能描述
```
手机号注册。

```

参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                             |
| ----------------- | -------- | ------ | ---- | ------------------------------------------------ |
| phone             | string   | -      | 是   | 手机号                                           |
| pwd               |    string      |    -    |   是   |         密码                            |
| smsCode           |  string        |  -      |   是   |      验证码                             |
| success           | function | -      | 否   | 接口调用成功的回调函数                           |
| fail              | function | -      | 否   | 接口调用失败的回调函数                           |
| complete          | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.phonePwdRegister({
    phone: '180xxxxx',
    pwd:'a123456',
    smsCode:'210320',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

### 6) 手机号密码登录: phonePwdLogin

功能描述
```
手机号密码登录。
```

参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                             |
| ----------------- | -------- | ------ | ---- | ------------------------------------------------ |
| internationalCode | string   | '86'   | 否   | 国家码                                           |
| phone             | string   | -      | 是   | 手机号                                           |
| pwd               |    string      |    -    |   是   |         密码                                         |
| success           | function | -      | 否   | 接口调用成功的回调函数                           |
| fail              | function | -      | 否   | 接口调用失败的回调函数                           |
| complete          | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.phonePwdLogin({
    phone: '180xxxxxx',
    pwd:'a123456',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

### 7) 手机号验证码登录:phoneSmsCodeLogin

功能描述
```
手机号验证码登录。
```

参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                             |
| ----------------- | -------- | ------ | ---- | ------------------------------------------------ |
| phone             | string   | -      | 是   | 手机号                                           |
| smsCode           | string   | -      | 是   | 验证码                                     |
| success           | function | -      | 否   | 接口调用成功的回调函数                           |
| fail              | function | -      | 否   | 接口调用失败的回调函数                           |
| complete          | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.phoneSmsCodeLogin({
    phone: '180xxxxxx',
    smsCode:'120321',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

### 8) 重置密码:userPwdReset

功能描述
```
通过手机号码或邮箱重置用户密码。（手机号码或邮箱 二选一）
```

参数
| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| code     | string   | -      | 是   | 验证码                                           |
| email    |   string      | -       |    否  |        邮箱                                          |
| phone    |    string      |-        |   否   |       手机号                                           |
| pwd      |  string        |     -   |   否   |          密码                                        |
| internationalCode         |    string     |    ‘86’   |    否  |       国家码                                          |
| success  | function | -      | 否   | 接口调用成功的回调函数                           |
| fail     | function | -      | 否   | 接口调用失败的回调函数                           |
| complete | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.userPwdReset({
    email: 'xx.xx@xx.com',
    code:'321010',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

### 9) 发送邮件验证码:sendEmail

功能描述
```
发送邮件验证码(注销/关联手机号)
```

参数
| 属性     | 类型     | 默认值  | 必填 | 说明                                             |
| --------| -------- | ------ | ---- | ------------------------------------------------ |
| email    | string   | -      | 是  |  收件人邮箱                                        |
| success  | function | -      | 否   | 接口调用成功的回调函数                           |
| fail     | function | -      | 否   | 接口调用失败的回调函数                           |
| complete | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
plugin.quecUser.sendEmail({
   email: 'xx@xx.com',
   success (res) {
        console.log(res)
   },
  fail (res) {
    console.log(JSON.stringify(res))
  }
 })
```

### 10) 获取用户信息:getUInfo

功能描述
```
获取用户信息。
```

参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.getUInfo({
     success (res) {
        console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

### 11) 退出登录: userLogout 

功能描述
```
退出登录。
```

参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.userLogout({
     success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

### 12) 用户注销:userCancel 

功能描述
```
用户注销。
```

参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| type | number |  默认为 7 天后删除 | 否 | 删除类型：1- 立即删除<br> 2- 7天后删除 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.userCancel({
     type:1,
     success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

### 13) 修改昵称: editNickname 

功能描述
```
修改昵称。
```

参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| nikeName | string |  - | 是 | 昵称 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.editNickname({
     nikeName:'示例名称',
     success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

# 五、设备管理

## 1、功能点
```
涵盖功能点：设备扫描安装、设备列表（展示、重命名、删除）、设备搜索
```

## 2、设备管理接口

### 1) 扫描设备安装二维码:scan 

功能描述
```
设备安装二维码扫描。
```

参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecManage.scan({
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 2) bindSubmit 
##### 功能描述
```
添加设备。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| pk | String |  - | 是 | 产品productKey |
| sn | String |  - | 是 | 设备sn |
| deviceName | String |  - | 是 | 设备名称 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回码
|Code | 说明 | 
| ---- | ---- | 
| 200 | 设备添加成功 | 

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecManage.bindSubmit({
     pk:'',
     sn:'',
     deviceName:'',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 3) getDeviceList 
##### 功能描述
```
获取设备列表。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| page | number |  - | 是 | 页码 |
| pageSize | number |  - | 是 | 页大小 |
| deviceName | String |  - | 否 | 设备名称 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecManage.getDeviceList({
     page:1,
     pageSize:10,
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 4) rename 
##### 功能描述
```
修改设备名称。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| pk | String |  - | 是 | 产品productKey |
| dk | String |  - | 是 | 设备deviceKey |
| deviceName | String |  - | 是 | 设备名称 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecManage.rename({
     pk:'',
     dk:'',
     deviceName:'',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 5) unbind 
##### 功能描述
```
设备删除。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| pk | String |  - | 是 | 产品productKey |
| dk | String |  - | 是 | 设备deviceKey |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecManage.unbind({
    pk:'',
    dk:'',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

## 六、设备控制模块
### 1、使用说明
```
涵盖功能点：设备详情通用面板控制。
```

### 2、设备控制接口
#### 1) getTslList 
##### 功能描述
```
获取当前设备的物模型属性（不含属性值）。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| pk | string |  - | 是 | 产品productkey |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecManage.getTslList({
     pk:'',
    success (res) {
         console.log(res.total)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 2) getTslVal 
##### 功能描述
```
获取当前设备的物模型属性有值的数据。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| pk | string |  - | 是 | 产品productkey |
| dk | string |  - | 是 | 设备的devicekey |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecManage.getTslVal({
     pk:'',
     dk:'',
    success (res) {
         console.log(res.total)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 3) deviceInfo 
##### 功能描述
```
获取设备详情信息
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| pk | string |  - | 是 | 产品productkey |
| dk | string |  - | 是 | 设备的devicekey |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecManage.deviceInfo({
     pk:'',
     dk:'',
    success (res) {
         console.log(res.total)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

## 七、webSocket接口
### 1、connect 
##### 功能描述
```
webSocket连接。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| userid | string |  - | 是 | 用户id |
| pk | string |  - | 是 | productKey |
| dk | string |  - | 是 | deviceKey |
| online | function |  - | 否 | 在线状态回调|
| ask | function |  - | 否 | 发送状态回调 |
| mattr | function |  - | 否 | 设备主动上报属性信息回调 |
| enduser | function |  - | 否 | 终端用户设备权限变更信息|
| location | function |  - | 否 | 设备定位信息上报回调 |
| ota | function |  - | 否 | ota升级回调 |
| error | function |  - | 否 | 接收云端发送的错误信息回调 |
| fail | function |  - | 否 | 失败回调 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
plugin.socket.connect({
    userid, pk, dk,
    online (res) {},
    ask (res) {},
    mattr (res) {
      switch (res.subtype) {
        case 'REPORT'://设备主动上报属性信息
          //处理设备主动上报属性信息
          break
        case 'OUTPUT'://设备服务调用响应信息
          //设备服务调用响应信息
          break
        case 'READRESP'://设备读响应信息
          //设备读响应信息
          break
        case 'INFO'://信息
          //信息
          break
        case 'WARN'://告警
          //告警
          break
        case 'ERROR'://故障
          //故障
          break
      }
    },
    enduser (res) {},
    error (res) {},
    fail (res) { }
})
```

### 2、close 
##### 功能描述
```
webSocket关闭。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 成功回调 |
| fail | function |  - | 否 | 失败回调 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.socket.close()
```

### 3、 send
##### 功能描述
```
指令下发
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| pk | string |  - | 是 | ProductKey|
| dk | string |  - | 是 | deviceKey|
| type | string |  - | 是 | 类型|
| sendData | array |  - | 是 | 发送数据|
| success | function |  - | 否 | 成功回调 |
| fail | function |  - | 否 | 失败回调 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
plugin.socket.send({
    pk, 
    dk,
    type:'WRITE-ATTR',
    sendData: [{"struct_1": [{"struct_attr" : 1}, {"struct_bool" : true}] }],
    success (res) {},
    fail (res) { }
})

```

## 八、主题配置
### 1、 setLogo 
##### 功能描述
```
设置logo。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| url | string |  - | 是 | logo 图片路径|

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.theme.setLogo(url)
```

### 2、 setSkin
##### 功能描述
```
设置换肤。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| style | object | skin = { primary: '#ec5c51', //主题色 radius: '10px', //圆角 text_h2: '#333333',//一级文本颜色 text_h3: '#666666',//二级文本颜色  text_h4: '#999999',//三级文本颜色 line: '#BFBFBF',//线条颜色 arrow: '#BFBFBF',//箭头颜色 cancel: '#999999'//弹框取消文字颜色}  | 是 | 需要设置的选项object|

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.theme.setSkin({primary:'#396CDB'})
```

### 3、 setTitle
##### 功能描述
```
设置小程序名称。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| title | string |  | 否 | 设置小程序名称|

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.theme.setTitle('示例DEMO')
```

## 九、用户域配置
### 1、 setUserDomain 
##### 功能描述
```
设置用户域。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| url | string |  -  | 否 | 设置用户域 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
plugin.config.setUserDomain('xxx')
```
### 2、 setUserDomainSecret 
##### 功能描述
```
设置用户域密钥。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| url | string | -  | 否 | 设置用户域密钥 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
plugin.config.setUserDomainSecret('xx')
```

### 3、 setToLoginFn 
##### 功能描述
```
token过期回调函数。
```
##### 参数
|回调函数 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| function | function |  | 是 | token过期回调函数 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
  plugin.config.setToLoginFn(() => {
      wx.redirectTo({
        url: '/pages/login/index'
      })
    })
```
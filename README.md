# 微信小程序SDK使用说明

## 一、功能列表
|功能模块 | 
| -------  |  
| 蓝牙配网 |
| 注册、登录、忘记密码、个人中心 |
| 设备管理 | 
| 设备分享 |
| 消息中心 | 
| 设备控制 |
| webSocket接口 |
| 用户域配置 | 
| 主题配置 |

## 二、快速上手
### 1、运行demo
```
1）下载微信开发者工具,下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2）下载该demo代码至本地，运行npm install
3）在微信开发者工具中导入项目-选择工具-构建npm，即可在模拟器中看到效果
```
### 2、在已有小程序中引用SDK
```
1）在您的小程序代码：app.json文件中
"plugins": {
  "quecPlugin": {
    "version": "1.3.1",
    "provider": "wx5e9a3feb8df9122e"
  }
}

2）如有自己的用户域，在app.js中请设置自己的用户域及密钥，接口如下：
const plugin = requirePlugin('quecPlugin')
plugin.config.setUserDomain('用户域')
plugin.config.setUserDomainSecret('用户域密钥')


3）授权：可将AppID和AppSecret提供给我们进行授权后，点击微信开发者工具-清缓存，然后点击“编译”即可正常运行。
```
### 3、特别说明
```
因微信官方限制,详见：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html,
建议使用企业小程序，个人小程序，手机号信息将无法获取，微信一键登录功能将不能正常使用。
其他登录方式可正常使用。
```

## 三、蓝牙配网
### 1、功能点
```
涵盖功能点：
蓝牙搜索及设备列表、网络配置、网络配置结果;
```
### 2、实现方式
```
提供两种使用方式：
1、含页面布局组件：提供页面及整体配网流程，引用页面组件即可。
2、提供配网js接口，需要使用者根据业务自己编写页面。
```
### 3、含页面布局组件
```
在json文件定义需要引入的自定义组件时,使用plugin://协议指明插件的引用名和自定义组件名。
例如：
{
  "usingComponents": {
    "wifi_scan":"plugin://quecPlugin/wifi_scan", // 蓝牙配网扫描添加
    "wifi_list":"plugin://quecPlugin/wifi_list", // 蓝牙配网添加成功后配置
  }
}
```

组件效果图：
![链接](./images/doc/ble.jpg)

|组件       | 属性    | 说明          |类型  | 默认值 |必填 | 事件 |
| ----      | ----   | ----          |----  |----   |---- | ---- |
| wifi_scan |        |               | -    |-      | -   |Back-返回跳转页面<br>List-设备配置页面      |
| wifi_list |succData| 配网成功的数据 |array |-      | 是   |saveSuccess-保存成功跳转页面   |

### 4、蓝牙配网接口
#### 1) openBle
##### 功能描述
```
初始化蓝牙模块。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回码
|Code | 说明 |
| ---- | ---- |
| 200 | 蓝牙初始化成功 |
| 100000 | 手机蓝牙开启失败 |
| 100001 | 手机蓝牙不可用, 请开启蓝牙再试 |
| 100002 | 获取本机蓝牙适配器状态失败 |
| 100003 | 蓝牙搜索功能打开失败 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecBle.openBle({
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 2) onBLEDeviceFound
##### 功能描述
```
搜索附近的蓝牙设备。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| callback | function |  - | 否 | 蓝牙低功耗设备的特征值变化事件的回调函数 |

##### Object.success回调（res）
|属性 | 类型 | 说明 |
| ---- | ---- | ---- |
| devices | Array Object |  搜索到的设备列表 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
plugin.quecBle.onBLEDeviceFound((res)=>{
   console.log(res)
 })
```

#### 3) closeBle
##### 功能描述
```
关闭蓝牙模块。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回码
|Code | 说明 |
| ---- | ---- |
| 200 | 蓝牙模块关闭成功 |
| 100014 | 蓝牙模块关闭失败 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecBle.closeBle({
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 4) stopBleScan
##### 功能描述
```
停止搜寻附近的蓝牙外围设备。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回码
|Code | 说明 |
| ---- | ---- |
| 200 | 附近的蓝牙外围设备搜寻停止成功 |
| 100015 | 附近的蓝牙外围设备搜寻停止失败 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecBle.stopBleScan({
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 5) connectBLE
##### 功能描述
```
连接蓝牙低功耗设备。
```

##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| deviceId | string |  - | 是 | 蓝牙设备 id |
| openDeviceFound | boolean |  false | 否 | 开启搜寻附近的蓝牙外围设备（如不是通过蓝牙搜索获取的deviceId,请传true） |
| timeout | number |  - | 否 | 超时时间，单位 ms，不填表示不会超时 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### Object.success回调（res）
|属性 | 类型 | 说明 |
| ---- | ---- | ---- |
| serviceId | string |  设备服务ID | 
| characteristicId | string |  设备特征ID | 

##### 返回码
|Code | 说明 |
| ---- | ---- |
| 200 | 蓝牙初始化成功 |
| 100000 | 手机蓝牙开启失败 |
| 100001 | 手机蓝牙不可用, 请开启蓝牙再试 |
| 100002 | 获取本机蓝牙适配器状态失败 |
| 100003 | 蓝牙搜索功能打开失败 |
| 100005 | 连接蓝牙失败 |
| 100006 | 蓝牙获取失败 |
| 100007 | 获取特征值失败 |
| 100013 | 设备不存在 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecBle.connectBLE({
     deviceId:"",
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 6) openNotifyBLE
##### 功能描述
```
启用蓝牙低功耗设备特征值变化时的 otify功能，订阅特征。
注意：必须设备的特征支持 notify 或者 indicate 才可以成功调用。
另外，必须先启用 wx.notifyBLECharacteristicValueChange才能监听到设备 characteristicValueChange 事件。
```

##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| deviceId | string |  - | 是 | 蓝牙设备 id |
| serviceId | string |  - | 是 | 蓝牙特征对应服务的 UUID |
| characteristicId | string |  - | 是 | 蓝牙特征的 UUID |
| state | boolean |  true | 是 | 是否启用 notify |
| type | string |  indication | 是 | 设置特征订阅类型，有效值有 notification 和 indication |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### Object.success回调（res）
|属性 | 类型 | 说明 |
| ---- | ---- | ---- |
| serviceId | string |  设备服务ID |
| characteristicId | string |  设备特征ID |

##### 返回码
|Code | 说明 |
| ---- | ---- |
| 200 | 启用低功耗蓝牙设备特征值变化时的notify功能成功 |
| 100008 | 启用低功耗蓝牙设备特征值变化时的notify功能失败 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecBle.openNotifyBLE({
     deviceId:'',
     serviceId:'',
     characteristicId:'',
     state:true,
     type:'notification',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 7) writeBLECharacteristicValue
##### 功能描述
```
向蓝牙低功耗设备特征值中写入二进制数据。
注意：必须设备的特征支持 write 才可以成功调用。
```

##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| deviceId | string |  - | 是 | 蓝牙设备 id |
| serviceId | string |  - | 是 | 蓝牙特征对应服务的 UUID |
| characteristicId | string |  - | 是 | 蓝牙特征的 UUID |
| ssid | string |  - | 是 | Wi-Fi 的 SSID |
| password | string |  - | 是 | Wi-Fi 设备密码 |
| isNew | boolean |  'old' | 否 | 是否是新固件（默认老固件） |
| writeType | string |  - | 否 | 蓝牙特征值的写模式设置，有两种模式，iOS 优先 write，安卓优先 writeNoResponse(基础库 2.22.0 开始支持） |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### Object.success回调（res）
|属性 | 类型 | 说明 |
| ---- | ---- | ---- |
| networkState | number |  1表示写入成功 |

##### 返回码
|Code | 说明 |
| ---- | ---- |
| 100009 | 写入数据失败 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecBle.writeBLECharacteristicValue({
     deviceId:'',
     serviceId:'',
     characteristicId:'',
     ssid:'',
     password:'',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 8) onBLECharacteristicValueChange
##### 功能描述
```
监听蓝牙低功耗设备的特征值变化事件。
必须先调用 openNotifyBLE 接口才能接收到设备推送的绑定信息。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### Object.success回调（res）
|属性 | 类型 | 说明 |
| ---- | ---- | ---- |
| productKey | string |  产品Productkey |
| deviceKey | string|  设备Devicekey |
| bindCode |string |  绑定信息 |
| networkState |number |  2 表示配网成功 |

##### 返回码
|Code | 说明 |
| ---- | ---- |
| 100011 | 低功耗蓝牙设备的特征值监听失败 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecBle.onBLECharacteristicValueChange({
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 9) closeBLEConnection
##### 功能描述
```
断开与蓝牙低功耗设备的连接。
```

##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| deviceId | string |  - | 是 | 蓝牙设备id |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回码
|Code | 说明 |
| ---- | ---- |
| 100010 | 低功耗蓝牙设备的连接断开失败 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecBle.closeBLEConnection({
     deviceId:'',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 10) getCurentWifi
##### 功能描述
```
获取当前已连接wifi信息。
```

##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function | - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### Object.success回调（res）
|属性 | 类型 | 说明 |
| ---- | ---- | ---- |
| ssid | string |  Wi-Fi 的 SSID |

##### 返回码
|Code | 说明 |
| ---- | ---- |
| 100004 | wifi获取失败 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecBle.getCurentWifi({
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 11) closeWifi
##### 功能描述
```
关闭Wi-Fi模块。
```

##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回码
|Code | 说明 |
| ---- | ---- |
| 200 | wiFi模块关闭成功 |
| 100012 | wiFi模块关闭失败 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecBle.closeWifi({
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```
v1.3.0 配网优化新增方法
#### 12) openBleAndLoc
##### 功能描述
```
开启蓝牙模块。(含开启蓝牙及定位权限)
```

##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回码
|Code | 说明 |
| ---- | ---- |
| 200 | wiFi模块关闭成功 |
| 100012 | wiFi模块关闭失败 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecBle.openBleAndLoc({
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 13) onBLEDeviceFoundV2
##### 功能描述
```
搜索附近的蓝牙设备。（解析蓝牙设备的广播数据段中pk、dk）
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| callback | function |  - | 否 | 蓝牙低功耗设备的特征值变化事件的回调函数 |

##### Object.success回调（res）
|属性 | 类型 | 说明 |
| ---- | ---- | ---- |
| devices | Array Object |  搜索到的设备列表 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
plugin.quecBle.onBLEDeviceFoundV2((res)=>{
   console.log(res)
 })
```

#### 14) getBluetoothStateChange
##### 功能描述
```
监听蓝牙适配器状态变化事件。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
plugin.quecBle.getBluetoothStateChange({
  success (res) {
      console.log(res)
  },
  fail (res) {
    console.log(JSON.stringify(res))
  }
})
```

#### 15) connectWifi
##### 功能描述
```
连接wifi。（跳转到wifi系统设置页面）
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| SSID | string |  - | 是 | Wi-Fi设备SSID |
| password | string |  - | 是 | Wi-Fi设备密码 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
plugin.quecBle.connectWifi({
  SSID:'',
  password:'',
  success (res) {
    console.log(res)
  },
  fail (res) {
    console.log(JSON.stringify(res))
  }
})
```

#### 16) onBLECharacteristicValueChangeV2
##### 功能描述
```
监听蓝牙低功耗设备的特征值变化事件。（兼容新、老固件）
必须先调用 openNotifyBLE 接口才能接收到设备推送的绑定信息。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| isNew | boolean |  'old' | 否 | 是否是新固件（默认老固件） |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### Object.success回调（res）
|属性 | 类型 | 说明 |
| ---- | ---- | ---- |
| productKey | string |  产品Productkey |
| deviceKey | string|  设备Devicekey |
| bindCode |string |  绑定信息 |
| networkState |number |  2 表示配网成功 |

##### 返回码
|Code | 说明 |
| ---- | ---- |
| 100011 | 低功耗蓝牙设备的特征值监听失败 |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecBle.onBLECharacteristicValueChangeV2({
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

## 四、注册、登录、忘记密码、个人中心
### 1、功能点
```
涵盖功能点：
1、手机号/邮箱注册
2、手机号/邮箱密码登录、微信一键登录、验证码登录
3、手机号/邮箱忘记密码
4、个人信息-展示、修改头像、修改昵称、修改密码、注销账户、退出登录;
6、关于- 标题、版本、电话（点击可拨打）
```
### 2、实现方式
```
提供两种实现方式：
1、含页面布局组件：提供页面流程，引用组件即可;
2、提供注册、登录、忘记密码js接口，需要使用者根据业务自己编写页面;
```
### 3、含页面布局组件
#### 1）组件引用
```
在json文件定义需要引入的自定义组件时,使用plugin://协议指明插件的引用名和自定义组件名。
例如：
{
  "usingComponents": {
    "wx_login":"plugin://quecPlugin/wx_login", //微信一键登录
    "user_start": "plugin://quecPlugin/user_start", //首页
    "user_login": "plugin://quecPlugin/user_login", //登录
    "user_login_code": "plugin://quecPlugin/user_login_code", //验证码登录
    "user_forget_pwd": "plugin://quecPlugin/user_forget_pwd", //忘记密码
    "user_register": "plugin://quecPlugin/user_register", //注册
    "user_valid_code": "plugin://quecPlugin/user_valid_code", //输入验证码
    "user_set_pwd":"plugin://quecPlugin/user_set_pwd", //设置密码
    "user_info": "plugin://quecPlugin/user_info", //用户信息展示
    "user_nickname": "plugin://quecPlugin/user_nickname", //昵称修改
    "user_cancel_index": "plugin://quecPlugin/user_cancel_index", //注销原因
    "user_cancel_sel": "plugin://quecPlugin/user_cancel_sel", //注销风险提示
    "user_cancel_send":"plugin://quecPlugin/user_cancel_send",//注销账户发送验证码
    "user_setting":"plugin://quecPlugin/user_setting",//设置
    "user_privacy_manage":"plugin://quecPlugin/user_privacy_manage",//隐私政策管理
    "user_about": "plugin://quecPlugin/user_about", //关于
  }
}
```
#### 2）组件效果图
![链接](./images/doc/login.jpg)

#### 3）组件说明
| 组件    | 属性  | 说明    | 类型 | 默认值  | 必填 | 事件 |
| ------ | ---   | ----- | ------- | ------ | ---- | ------ |
| user_start | - | -  | -  | - | -   | changeProtocol-是否选中协议<br>toLogin-手机号/邮箱登录<br>toProtocol-服务协议<br>toPrivacy-隐私政策 |
| wx_login |  agreecheck| 是否勾选隐私协议 | boolean | false | 否   | wxLoginSuccess-微信一键登录成功回调<br>wxLoginResult-登录成功回调 |
| wx_login |  privacyVersion| 隐私协议版本 | string | - | 否   |  |
| wx_login |  protocolVersion| 服务协议版本 | string | - | 否   |  |
| user_login | privacyVersion| 隐私协议版本 | string | - | 否   | toCodeLogin-跳转到验证码登录页面<br>toForgetPwd-跳转到忘记密码页面<br>loginSuccess-登录成功回调<br>toRegister-跳转到立即注册页面  |
| user_login | protocolVersion| 服务协议版本 | string | - | 否   |  |
| user_login_code | - | -  | - | -   | -   | topwdLogin-跳转到密码登录页面<br>toRegister-跳转到立即注册页面<br>toEnterCode-跳转到输入验证码页面 |
| user_forget_pwd | type | 类型（2-忘记密码<br>4-修改密码） | number | -  | - | toRegister-跳转到注册页面<br> toEnterCode-跳转输入密码页面|
| user_forget_pwd | uname | 账号（手机号/邮箱）| string  | -  | - |-  |
| user_valid_code | uname | 账号（手机号/邮箱）| string  | -  | - | loginSuccess-验证码登录成功回调<br>codeSuccess-验证码输入成功回调 |
| user_valid_code | type | 类型（1-验证码登录<br>2-忘记密码<br>3-注册<br>4-修改密码） | number  | -  | - |  |
| user_valid_code |  privacyVersion| 隐私协议版本 | string | - | 否   |  |
| user_valid_code |  protocolVersion| 服务协议版本 | string | - | 否   |  |
| user_set_pwd | item | 账号/验证码/类型对象({uname, code, type}) | Object | - | 否   | setSuccess-密码设置成功  |
| user_set_pwd | privacyVersion| 隐私协议版本 | string | - | 否   |  |
| user_set_pwd | protocolVersion| 服务协议版本 | string | - | 否   |  |                                   |
| user_register | - | -   | - | -   | - | toLogin-去登陆（已注册账号）<br> toEnterCode- 跳转到输入验证码页面 |
| user_info | - |  - | - | - | - | goNikeName-跳转到修改昵称页面<br> goChangePwd-跳转到修改密码页面<br> logoutSuccess-退出成功回调<br>goCancel-跳转到注销账号页面<br>relatePhone-是否显示手机号授权弹框|
| user_nickname | nikeName |  昵称 | string | - | 是 | nicknameEditSuccess-昵称修改成功回调|
| user_about | version |  版本号 | string | 1.0.0 | 否 | - |
| user_about | phone |  电话 | string | +86 0551-65869386 | 否 |-|
| user_cancel_index | uname |  账号（手机号/邮箱） | string | - | 是 |-|
| user_cancel_sel | uname |  账号（手机号/邮箱） | string | - | 是 |Send-跳转到注销发送验证码页面|
| user_cancel_send | type |  类型（7-注销 2-关联手机号） | number | - | 否 | -|
| user_cancel_send | uname |  账号（手机号/邮箱） | string | - | 是 | - |
| user_setting | isHouse | 是否显示家居模式开关 | boolean | true | 否 | toHouse-跳转到家庭管理页面<br>PrivacyManage-跳转到隐私政策管理页面<br>toEnterHouse-进入家居模式<br>toEnterDetail-进入家居模式了解详情页面 |
| user_setting | isPrivacyManage |  是否显示隐私政策管理 | boolean | true | 否 | - |
| user_edit_pwd | uname |  账号（手机号/邮箱） | string | - | 是 |Send-跳转到注销发送验证码页面|
| user_edit_pwd | type | 类型（2-忘记密码<br>4-修改密码） | number | -  | - | toRegister-跳转到注册页面<br> toEnterCode-跳转输入密码页面|

#### 4）微信一键登录具体实现
```
在插件开发中，部分API受限制，无法在插件中直接使用，如：获取用户信息，获取用户号码等，因此微信一键登录组件，采用抽象节点的方式实现。
1)小程序miniprogram端app.json中，配置插件信息
  "plugins": {
    "quecPlugin": {
      "version": "1.3.1",
      "provider": "wx5e9a3feb8df9122e"
    }
  }

2)小程序miniprogram端components中新建wx_info组件，将用户信息getUserInfo及手机号信息getPhoneNumber通过事件绑定传递出去,同时设置如下属性：
phoneVisible-是否展示获取用户号码授权弹框
isCheck-是否勾选用户协议

3）小程序端页面调用：
json文件中配置
"usingComponents": {
  "wx_login": "plugin://quecPlugin/wx_login",
  "wx_info": "../../components/wx_info/index"
}
wxml文件中：
 <wx_login generic:wx_info="wx_info" agreecheck="{{checked}}" bindwxLoginSuccess="loginResult"></wx_login>
```

### 4、注册、登录、忘记密码、个人中心接口
#### 1) wxLogin 
##### 功能描述
```
微信一键登录。
```
##### 参数
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
##### 示例代码
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

#### 2) sendPhoneSmsCode
##### 功能描述
```
发送手机短信验证码。
```
##### 参数
| 属性   | 类型     | 默认值 | 必填 | 说明           |
| ------ | -------- | ------ | ---- | --------------|
| phone | string   | - | 是   | 手机号  |
| ssid  | string   | - |  是 | 企业短信签名ID  ('C1'-阿里云)                                            |
| stid  | string  |  - | 是 | 企业短信模板ID ( 'C1'-国内忘记密码<br>'C2'-国内登录<br>'C3'-国内注册<br> 'C7'- 国内账号注销 |
| success  | function | -  | 否   | 接口调用成功的回调函数                           |
| fail     | function | -  | 否   | 接口调用失败的回调函数                           |
| complete | function | -  | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.sendPhoneSmsCode({
    phone: '18095653439',
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

#### 3) validateSmsCode
##### 功能描述
```
验证短信验证码。
```
##### 参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                             |
| ----------------- | -------- | ------ | ---- | ------------------------------------------------ |
| phone             | string   | -      | 是   | 手机号                                           |
| smsCode           | string   | -      | 是   | 短信验证码                                       |
| isDisabled        | number   |    1   | 否   | 验证码验证后是否失效，1：失效 2：不失效，默认 1   |
| success           | function | -      | 否   | 接口调用成功的回调函数                           |
| fail              | function | -      | 否   | 接口调用失败的回调函数                           |
| complete          | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.validateSmsCode({
    phone: '18095653439',
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

#### 4) isPhoneRegister
##### 功能描述
```
验证手机号是否注册。
```
##### 参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                             |
| ----------------- | -------- | ------ | ---- | ------------------------------------------------ |
| phone             | string   | -      | 是   | 手机号                                           |
| success           | function | -      | 否   | 接口调用成功的回调函数                           |
| fail              | function | -      | 否   | 接口调用失败的回调函数                           |
| complete          | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.isPhoneRegister({
    phone: '180xxxxxxxx',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 5) phonePwdRegister
##### 功能描述
```
手机号注册。
```
##### 参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                             |
| ----------------- | -------- | ------ | ---- | ------------------------------------------------ |
| phone             | string   | -      | 是   | 手机号                                           |
| pwd               |    string      |    -    |   是   |         密码                            |
| smsCode           |  string        |  -      |   是   |      验证码                             |
| success           | function | -      | 否   | 接口调用成功的回调函数                           |
| fail              | function | -      | 否   | 接口调用失败的回调函数                           |
| complete          | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.phonePwdRegister({
    phone: '18095653439',
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

#### 6) phonePwdLogin
##### 功能描述
```
手机号密码登录。
```
##### 参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                             |
| ----------------- | -------- | ------ | ---- | ------------------------------------------------ |
| internationalCode | string   | '86'   | 否   | 国家码                                           |
| phone             | string   | -      | 是   | 手机号                                           |
| pwd               |    string      |    -    |   是   |         密码                                         |
| success           | function | -      | 否   | 接口调用成功的回调函数                           |
| fail              | function | -      | 否   | 接口调用失败的回调函数                           |
| complete          | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.phonePwdLogin({
    phone: '18095653439',
    pwd:'a123456',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 7) phoneSmsCodeLogin
##### 功能描述
```
手机号验证码登录。
```
##### 参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                             |
| ----------------- | -------- | ------ | ---- | ------------------------------------------------ |
| phone             | string   | -      | 是   | 手机号                                           |
| smsCode           | string   | -      | 是   | 验证码                                     |
| success           | function | -      | 否   | 接口调用成功的回调函数                           |
| fail              | function | -      | 否   | 接口调用失败的回调函数                           |
| complete          | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.phoneSmsCodeLogin({
    phone: '18095653439',
    smsCode:'120321',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 8) sendEmailRegisterCode
##### 功能描述
```
发送邮件注册验证码。
```
##### 参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                             |
| ----------------- | -------- | ------ | ---- | ------------------------------------------------ |
| email             | string   | -      | 是   | 邮箱                                           |
| success           | function | -      | 否   | 接口调用成功的回调函数                           |
| fail              | function | -      | 否   | 接口调用失败的回调函数                           |
| complete          | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.sendEmailRegisterCode({
    email: 'daney.hong@quectel.com',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 9) emailPwdRegister
##### 功能描述
```
邮箱注册。
```
##### 参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                         |
| ----------------- | --------| ------ | ---- | ------------------------------------------- |
| email             | string   | -     | 是   | 邮箱                                         |
| pwd               | string   | -     | 是   | 密码                                         |
| code              | string   | -     | 是   | 验证码                                       |
| success           | function | -     | 否   | 接口调用成功的回调函数                         |
| fail              | function | -     | 否   | 接口调用失败的回调函数                         |
| complete          | function | -     | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.emailPwdRegister({
    email: 'daney.hong@quectel.com',
    pwd:'a123456',
    code:'160210',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 10) emailPwdLogin
##### 功能描述
```
邮箱密码登录。
```
##### 参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                             |
| ----------------- | -------- | ------ | ---- | ------------------------------------------------ |
| email             | string   | -      | 是   | 邮箱                                       |
| pwd               |    string      |    -    |   是   |         密码                                         |
| success           | function | -      | 否   | 接口调用成功的回调函数                           |
| fail              | function | -      | 否   | 接口调用失败的回调函数                           |
| complete          | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.emailPwdLogin({
    email: 'daney.hong@quectel.com',
    pwd:'a123456',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 11) sendEmailRepwdCode
##### 功能描述
```
发送邮件重置验证码。
```
##### 参数
| 属性              | 类型     | 默认值 | 必填 | 说明                                             |
| ----------------- | -------- | ------ | ---- | ------------------------------------------------ |
| email             | string   | -      | 是   | 邮箱                                       |
| success           | function | -      | 否   | 接口调用成功的回调函数                           |
| fail              | function | -      | 否   | 接口调用失败的回调函数                           |
| complete          | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.sendEmailRepwdCode({
    email: 'daney.hong@quectel.com',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 12) userPwdReset
##### 功能描述
```
通过手机号码或邮箱重置用户密码。（手机号码或邮箱 二选一）
```
##### 参数
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

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.userPwdReset({
    email: 'daney.hong@quectel.com',
    code:'321010',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 13) validateEmailCode
##### 功能描述
```
验证邮箱短信验证码是否有效
```
##### 参数
| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| code     | string   | -      | 是   | 验证码                                           |
| email    |   string      | -       |    否  |        邮箱                                          |
| isDisabled                  |    number      |    1    |   否   | 验证码验证后是否失效，1：失效 2：不失效，默认 1   |
| success  | function | -      | 否   | 接口调用成功的回调函数                           |
| fail     | function | -      | 否   | 接口调用失败的回调函数                           |
| complete | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
plugin.quecUser.validateEmailCode({
   code: '123456',
   email: 'xx@qq.com',
   isDisabled: 2,
   success (res) {
        console.log(res)
   },
  fail (res) {
    console.log(JSON.stringify(res))
  }
 })
```

#### 14) sendEmail
##### 功能描述
```
发送邮件验证码(注销/关联手机号)
```
##### 参数
| 属性     | 类型     | 默认值  | 必填 | 说明                                             |
| --------| -------- | ------ | ---- | ------------------------------------------------ |
| email    | string   | -      | 是  |  收件人邮箱                                        |
| success  | function | -      | 否   | 接口调用成功的回调函数                           |
| fail     | function | -      | 否   | 接口调用失败的回调函数                           |
| complete | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
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

#### 15) getUInfo
##### 功能描述
```
获取用户信息。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
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

#### 16) userLogout 
##### 功能描述
```
退出登录。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
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

#### 17) userCancel 
##### 功能描述
```
用户注销。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| type | number |  默认为 7 天后删除 | 否 | 删除类型：1- 立即删除<br> 2- 7天后删除 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |
##### 示例代码
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

#### 18) editNickname 
##### 功能描述
```
修改昵称。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| nikeName | string |  - | 是 | 昵称 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |
##### 示例代码
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

#### 19) editHeadImg 
##### 功能描述
```
修改头像。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| headImage | String |  - | 是 | 修改头像地址 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |
##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.editHeadImg({
    headImage:'',
    success (res) {
      console.log(res)
    },
    fail (res) {
     console.log(JSON.stringify(res))
  }
 })
```

#### 20) relationPhone 
##### 功能描述
```
关联手机号。
```
##### 参数
| 属性     | 类型     | 默认值 | 必填 | 说明                                            |
| -------- | -------- | ------ | ---- | ----------------------------------------------|
| code   |  string    |  -     |   是   |    验证码  |
| phone  | string  | -    |   是   |   手机号   |
| success  | function | -      | 否   | 接口调用成功的回调函数                           |
| fail     | function | -      | 否   | 接口调用失败的回调函数                           |
| complete | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）    |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.relationPhone({
     code:'123456',
     phone:'180xxxxxxxx',
     success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 21) isEmailRegister 
##### 功能描述
```
邮箱是否注册
```
##### 参数
| 属性     | 类型     | 默认值 | 必填 | 说明                                            |
| -------- | -------- | ------ | ---- | ----------------------------------------------|
| email   |  string    |  -    |   是   |    邮箱  |
| success  | function | -      | 否   | 接口调用成功的回调函数                           |
| fail     | function | -      | 否   | 接口调用失败的回调函数                           |
| complete | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）    |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecUser.isEmailRegister({
     code:'123456',
     phone:'180xxxxxxxx',
     success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```


## 五、设备管理
### 1、功能点
```
涵盖功能点：设备扫描安装、设备列表（展示、重命名、删除）、设备搜索
```

### 2、实现方式
```
提供两种实现方式：
1、含页面布局组件：提供页面流程，引用组件即可。详见"含页面布局组件使用"。
2、提供设备管理js接口，需要使用者根据业务自己编写页面。详见"设备管理接口"。
```
### 3、含页面布局组件使用
#### 1）组件引用
```
在json文件定义需要引入的自定义组件时,使用plugin://协议指明插件的引用名和自定义组件名。
{
  "usingComponents": {
      "device_add": "plugin://quecPlugin/device_add",   // 设备扫码安装
      "device_list": "plugin://quecPlugin/device_list",   // 设备列表
      "device_rename": "plugin://quecPlugin/device_rename",   // 设备详情更多设置-重命名
      "device_search": "plugin://quecPlugin/device_search", //设备搜索
  }
}
```
#### 2）组件效果图
![链接](./images/doc/manage.jpg)

#### 3）组件说明
|组件 | 属性 | 说明 |类型 |默认值 |必填 |事件
| ---- | ---- | ---- |---- |---- |---- |---- |
| device_add | item |  扫描的返回的结果信息 | Object |- | 是 | scanSuccess-扫描成功回调
| device_add | btnStyle |  按钮样式 |string| - | 否 | addSuccess-添加成功回调
| device_list | actionBg |  重命名、分享、删除背景色 |Object|	actionBg:{rename:#666666; share: '#3A77FF';del: '#E46155'}| 否 | scanSuccess-扫描成功回调
| device_list | isRefresh |  是否刷新列表 | boolean | false | 否 | renameSuccess-重命名成功回调、addSuccess-添加成功回调
| device_list | slideImg |  设置列表右滑图片 | string | /assets/images/device/slide.png | 否 | goDetail-跳转到设备详情
| device_list | renameImg |  设置列表重命名图片 | string | /assets/images/device/rename.png | 否 | goShare-跳转到分享
| device_list | shareImg |  设置列表分享图片 | string | /assets/images/device/share.png | 否 | unbindSuccess-删除成功回调
| device_list | delImg |  设置列表删除图片 | string | /assets/images/device/del.png | 否 |
| device_list | noDataImg |  设置列表无数据展示图片 | string | /assets/images/device/no_device_data.png | 否 |
| device_rename | btnStyle |  按钮样式 |string| - | 否 | renameSuccess-重命名成功回调
| device_rename | curItem |  当前设备数据信息 | string| - | 否 |

### 4、设备管理接口
#### 1) scan 
##### 功能描述
```
设备安装二维码扫描。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |
##### 返回码
|Code | 说明 | 
| ---- | ---- | 
| 110000 | 二维码不正确，请重新扫描 | 

##### 示例代码
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
| sn | String |  - | 是 | 设备sn |
| deviceName | String |  - | 是 | 设备名称 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecManage.rename({
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

#### 5) unbind 
##### 功能描述
```
设备删除。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| pk | String |  - | 是 | 产品productKey |
| sn | String |  - | 是 | 设备sn |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecManage.unbind({
      pk:'',
     sn:'',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

## 六、设备分享
### 1、功能点
```
涵盖功能点：
1、设备分享码展示
2、刷新
3、管理分享用户列表
```

### 2、实现方式
```
提供两种实现方式：
1、含页面布局组件：提供页面流程，引用组件即可。详见"含页面布局组件使用"。
2、提供个人中心-我的js接口，需要使用者根据业务自己编写页面。详见"设备分享接口"。
```
### 3、含页面布局组件使用
#### 1）组件引用
```
{
  "usingComponents": {
    "device_share": "plugin://quecPlugin/device_share"   // 设备分享
  }
}
```
#### 2）组件效果图
![链接](./images/doc/share.jpg)

#### 3）组件说明
|组件 | 属性 | 说明 |类型 |默认值 |必填 |事件
| ---- | ---- | ---- |---- |---- |---- |---- |
| device_share | curItem |  当前设备信息 | Object |- | 是 |invalidDevice-无效设备回调
| device_share | headImage |  按钮颜色 |string| #ec5c51 | 否 |
| device_share | noDataImg |  按钮样式 |string| - | 否 |

### 4、设备分享接口
#### 1) shareInfo 
##### 功能描述
```
获取设备分享码text。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| pk | String |  - | 是 | 产品productKey |
| sn | String |  - | 是 | 设备sn |
| acceptingExpireAt  | number |  - | 是 | 分享二维码种子失效时间 时间戳（毫秒），表示该分享在此时间戳时间内没有使用，会失效 |
| sharingExpireAt | number |  - | 否 | 设备使用到期时间 时间戳（毫秒），表示该分享的设备，被分享人可以使用的时间如果不填，则为终生有效，只有授权人主动解绑 |
| coverMark | number |  1 | 否 | 覆盖标志:1、直接覆盖上条有效分享（默认）(覆盖原有的分享码);2、直接添加，允许多条并存;3、只有分享时间延长了，才允许覆盖上条分 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecShare.shareInfo({
     dk:'',
     pk: '',
    coverMark: 1,
     acceptingExpireAt: 30 * 60 * 1000 + (new Date().getTime()),
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 2) getShareUserData 
##### 功能描述
```
管理分享码权限列表。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| pk | String |  - | 是 | 产品productKey |
| sn | String |  - | 是 | 设备sn |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecShare.getShareUserData({
     dk:'',
     pk: '',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 3) removeShare 
##### 功能描述
```
分享人取消设备分享。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| shareCode | String |  - | 是 | 分享码 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecShare.removeShare({
     shareCode:'',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 4) sharedAccept 
##### 功能描述
```
被分享人接受分享。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| shareCode | String |  - | 是 | 分享码 |
| deviceName | String |  - | 否 | 设备名称 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecShare.sharedAccept({
     shareCode:'',
     deviceName:'',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 5) shareRename 
##### 功能描述
```
被分享人重命名分享设备。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| shareCode | String |  - | 是 | 分享码 |
| deviceName | String |  - | 否 | 设备名称 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecShare.shareRename({
     shareCode:'',
     deviceName:'',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 6) beSharedRemove 
##### 功能描述
```
被分享人移除分享。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| shareCode | String |  - | 是 | 分享码 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecShare.beSharedRemove({
     shareCode:'',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

## 七、消息中心
### 1、功能点
```
涵盖功能点：
1、消息（通知、告警、故障）列表展示
2、删除
3、标记已读
4、单条消息已读
```
### 2、实现方式
```
提供两种实现方式：
1、含页面布局组件：提供页面流程，引用组件即可。详见"含页面布局组件使用"。
2、提供消息js接口：需要使用者根据业务自己编写页面。详见"消息中心接口"。
```
### 3、含页面布局组件使用
#### 1）组件引用
```
{
  "usingComponents": {
    "msg_list": "plugin://quecPlugin/msg_list",   //消息中心
    "device_alarm": "plugin://quecPlugin/device_alarm", //告警记录
  }
}
```
#### 2）组件效果图
![链接](./images/doc/msg.jpg)

#### 3）组件说明
|组件 | 属性 | 说明 |类型 |默认值 |必填 |事件
| ---- | ---- | ---- |---- |---- |---- |---- |
| msg_list | isSet |  是否刷新消息列表 | boolean | - | 否 | toDetail-跳转到设备详情
| msg_list | delImg |  设置删除图片 |string| /assets/images/device/del.png | 否 | delSuccess-删除成功回调
| msg_list | noDataImg |  设置无数据图片 |string| /assets/images/device/ic_msg_empty.png | 否 | readSuccess-标记全读回调
| msg_list | tabColor |  tab激活样式 |string| #ec5c51 | 否 |
| device_alarm | pk |  产品productkey |string| - | 否 |
| device_alarm | dk |  设备devicekey |string| - | 否 |
| device_alarm | activeStepColor |  步骤条激活状态的颜色值 |string| #999999 | 否 |
| device_alarm | noDataImg |  设置无数据图片 |string| /assets/images/device/ic_msg_empty.png | 否 |

### 4、消息中心接口
#### 1) getMsgList 
##### 功能描述
```
获取消息列表数据。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| page | number |  1 | 是 | 页码 |
| pageSize | number |  10 | 是 | 页大小 |
| msgType | number |  - | 1 | 消息类型1-通知； 2-告警； 3-故障 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecMsg.getMsgList({
     page:1,
     pageSize：10，
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 2) msgDelete 
##### 功能描述
```
消息删除。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| msgId | String |  - | 是 | 消息id |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecMsg.msgDelete({
     msgId:'',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

#### 3) readMsg 
##### 功能描述
```
标记已读。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| msgType | number |  - | 是 | 1-通知 2-告警 3-故障 |
| success | function |  - | 否 | 接口调用成功的回调函数 |
| fail | function |  - | 否 | 接口调用失败的回调函数 |
| complete | function |  - | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecMsg.readMsg({
     msgType:'',
    success (res) {
         console.log(res)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```
#### 4) getMsgNoReadList 
##### 功能描述
```
获取未读消息数量。
```
##### 参数
| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| msgType  | number   | -      | 否   | 1-通知 2-告警 3-故障                             |
| success  | function | -      | 否   | 接口调用成功的回调函数                           |
| fail     | function | -      | 否   | 接口调用失败的回调函数                           |
| complete | function | -      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.quecMsg.getMsgNoReadList({
     msgType:'',
    success (res) {
         console.log(res.total)
     },
     fail (res) {
        console.log(JSON.stringify(res))
      }
 })
```

## 八、设备控制模块
### 1、使用说明
```
涵盖功能点：设备详情通用面板控制、设置、设备分享、告警记录、设备重命名。
```
### 2、实现方式
```
提供两种实现方式：
1、含页面布局组件：提供页面流程，引用组件即可; 详见"含页面布局组件使用"。
2、提供设备控制js接口：需要使用者根据业务自己编写页面; 详见"设备控制接口"。
```
### 3、自定义组件使用
#### 1）组件引用
```
{
  "usingComponents": {
    "device_detail": "plugin://quecPlugin/device_detail",   //详情面板
    "device_tsl_edit_text": "plugin://quecPlugin/device_tsl_edit_text",   //详情文本下发
    "device_tsl_edit_array": "plugin://quecPlugin/device_tsl_edit_array",   //详情数组下发
    "device_tsl_edit_struct": "plugin://quecPlugin/device_tsl_edit_struct",   //详情结构体下发
    "device_tsl_edit_struct_text": "plugin://quecPlugin/device_tsl_edit_struct_text",   //详情结构体中文本下发
    "device_detail_set": "plugin://quecPlugin/device_detail_set",   //详情-设置
    "device_alarm": "plugin://quecPlugin/device_alarm",   //详情-告警记录
    "device_share": "plugin://quecPlugin/device_share",   //详情-分享管理
    "device_rename": "plugin://quecPlugin/device_rename",   //详情-设备名称修改
  }
}
```
#### 2）组件效果图
![链接](./images/doc/control.jpg)

#### 3）组件说明

|组件 | 属性 | 说明 |类型 |默认值 |必填 |事件
| ---- | ---- | ---- |---- |---- |---- |---- |
| device_detail | pk |  产品ProductKey | string | - | 是 | editpage-TEXT、ARRAY、STRUCT跳转到对应属性页面
| device_detail | dk |  设备deviceKey |string| - | 是 | invalid-无效设备回调
| device_detail | curItem | 设备信息 |object| {} | 是 | back-返回页面回调
| device_tsl_edit_text | pk |  产品ProductKey | string | - | 是 | back-返回页面回调
| device_tsl_edit_text | dk |  设备deviceKey |string| - | 是 | 
| device_tsl_edit_text | btnStyle | 按钮样式 |string| - | 否 | 
| device_tsl_edit_text | btnColor | 按钮颜色值 |string| - | 否 | 
| device_tsl_edit_text | attrData | 属性数据 |object| - | 是 | 
| device_tsl_edit_array | pk |  产品ProductKey | string | - | 是 | back-返回页面回调
| device_tsl_edit_array | dk |  设备deviceKey |string| - | 是 | 
| device_tsl_edit_array | btnStyle | 按钮样式 |string| - | 否 | 
| device_tsl_edit_array | btnColor | 按钮颜色值 |string| #ec5c51 | 否 | 
| device_tsl_edit_array | attrData | 属性数据 |object| - | 是 | 
| device_tsl_edit_struct | pk |  产品ProductKey | string | - | 是 | back-返回页面回调
| device_tsl_edit_struct | dk |  设备deviceKey |string| - | 是 | editStructText-设置文本属性回调
| device_tsl_edit_struct | btnStyle | 按钮样式 |string| - | 否 | 
| device_tsl_edit_struct | btnColor | 按钮颜色值 |string| #ec5c51 | 否 | 
| device_tsl_edit_struct | attrData | 属性数据 |object| - | 是 | 
| device_tsl_edit_struct | arrowColor | 箭头颜色 |string| #BFBFBF | 否 | 
| device_tsl_edit_struct | cancelColor | 弹框取消颜色值 |string| #999999 | 否 | 
| device_tsl_edit_struct | textDetail | 文本框编辑属性数据 |object| - | 是 | 
| device_tsl_edit_struct_text | btnStyle | 按钮样式 |string| - | 否 | back-返回页面回调
| device_tsl_edit_struct_text | btnColor | 按钮颜色值 |string| #ec5c51 | 否 | 
| device_tsl_edit_struct_text | attrData | 属性数据 |object| - | 是 | 
| device_tsl_edit_struct_text | curkey | 当前数据的索引值 |string| - | 是 | 
| device_detail_set | curItem | 设备信息 |object| {} | 是 |goRename-跳转到设备重命名页面;goShare-跳转到设备分享页面；goAlarm-跳转到告警记录页面
| device_alarm | pk |  产品ProductKey | string | - | 是 | 
| device_alarm | dk |  设备deviceKey |string| - | 是 | 
| device_share | curItem |  设备信息 |object| {} | 是 | invalidDevice-无效设备回调
| device_rename | curItem |  设备信息 |object| {} | 是 | renameSuccess-重命名成功回调

### 4、设备控制接口
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

## 九、webSocket接口
### 1、connectSocket 
##### 功能描述
```
webSocket连接。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| obj | object |  - | 是 | obj{pk,dk})|

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.webSocket.connectSocket()
```

### 2、closeSocket 
##### 功能描述
```
webSocket关闭。
```
##### 参数
无

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.webSocket.closeSocket()
```

### 3、 sendCmd 
##### 功能描述
```
指令下发
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| obj | object |  - | 是 | obj{pk, dk, type, sendData}|

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 let sendData = [{
        id: attrData.id,
        value: sendValue,
        type: attrData.dataType
 }]
 plugin.webSocket.sendCmd({ pk, dk, type, sendData })
```

### 4、 msgCallback 
##### 功能描述
```
获取websocket返回res数据。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| callBack | function |  - |  | 获取websocket返回res数据|

##### 示例代码
```
const plugin = requirePlugin('quecPlugin')
 plugin.webSocket.msgCallback(function(res){
     // websocket 数据渲染
 })
```

### 5、subscribeDevice
##### 功能描述
```
设备订阅。
```
##### 参数
|属性 | 类型 | 默认值 |必填 |说明 |
| ---- | ---- | ---- |---- |---- |
| obj | object |  - | 是  | obj{pk:'productKey',dk:'deviceKey'}|

##### 示例代码
```
 const plugin = requirePlugin('quecPlugin')
 plugin.webSocket.subscribeDevice({pk:'',dk:''})
```

## 十、主题配置
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

## 十一、用户域配置
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
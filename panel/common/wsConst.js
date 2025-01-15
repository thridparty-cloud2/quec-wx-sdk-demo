
export default {
  /**
 * 命令字类型---登录
 * @type {string}
 */
  CMD_LOGIN: 'login',

  /**
 * 命令字类型---登录响应
 * @type {string}
 */
  CMD_LOGIN_RESP: 'login_resp',

  /**
 * 命令字类型---订阅
 * @type {string}
 */
  CMD_SUBSCRIBE: 'subscribe',

  /**
 * 命令字类型---订阅响应
 * @type {string}
 */
  CMD_SUBSCRIBE_RESP: 'subscribe_resp',
  /**
 * 命令字类型---消息
 * @type {string}
 */
  CMD_MESSAGE: 'message',

  /**
   * 命令字类型---发送指令
   * @type {string}
   */
  CMD_SEND: 'send',

  /**
 * 命令字类型---发送指令响应
 * @type {string}
 */
  CMD_SEND_ACK: 'send_ack',

  /**
 * 命令字类型---错误信息
 * @type {string}
 */
  CMD_ERROR: 'error',

  /**
 * 命令字类型---取消订阅
 * @type {string}
 */
  CMD_UNSUBSCRIBE: 'unsubscribe',

  /**
 * 命令字类型---取消订阅响应
 * @type {string}
 */
  CMD_UNSUBSCRIBE_RESP: 'unsubscribe_resp',

  /**
   * 可以订阅的消息类型--- 设备上下线信息
   * @type {string}
   */
  MSG_TYPE_ONLINE: 'ONLINE',

  /**
   * 可以订阅的消息类型--- 设备和模组状态信息
   * @type {string}
   */
  MSG_TYPE_STATUS: 'STATUS',

  /**
   * 可以订阅的消息类型--- 透传产品--设备上行信息
   * @type {string}
   */
  MSG_TYPE_RAW_UPLINK: 'RAW-UPLINK',

  /**
   * 可以订阅的消息类型--- 物模型产品--设备上报属性信息
   * @type {string}
   */
  MSG_TYPE_M_ATTR_REPORT: 'MATTR-REPORT',

  /**
 * 可以订阅的消息类型--- 物模型产品--设备事件信息
 * @type {string}
 */
  MSG_TYPE_M_EVENT_INFO: 'MEVENT-INFO',

  /**
   * 可以订阅的消息类型--- 物模型产品--设备事件告警
   * @type {string}
   */
  MSG_TYPE_M_EVENT_WARN: 'MEVENT-WARN',

  /**
 * 可以订阅的消息类型--- 物模型产品--设备事件故障
 * @type {string}
 */
  MSG_TYPE_M_EVENT_ERROR: 'MEVENT-ERROR',

  /**
   * 可以订阅的消息类型--- 设备定位信息上报
   * @type {string}
   */
  MSG_TYPE_LOCATION_INFO_KV: 'LOCATION-INFO-KV',

  /***
 * 发送指令类型---物模型属性-读,
 * @type {string}
 */
  SEND_CMD_TYPE_READ_ATTR: 'READ-ATTR',

  /***
   * 发送指令类型---物模型属性-写,
   * @type {string}
   */
  SEND_CMD_TYPE_WRITE_ATTR: 'WRITE-ATTR',

  /***
   * 发送指令类型---调用物模型服务
   * @type {string}
   */
  SEND_CMD_TYPE_EXE_SERV: 'EXE-SERV',

  /***
 * 发送指令类型---透传命令
 * @type {string}
 */
  SEND_CMD_TYPE_RAW: 'RAW',
  /**
   * 心跳数据
   * @type {string}
   */
  HEART_DATA: 'pong',

  /**
 * 监听消息类型----属性（物模型）
 * @type {string}
 */
  LISTENER_MSG_TYPE_M_ATTR: 'MATTR',

  /**
 * 监听消息类型----事件（物模型）
 * @type {string}
 */
  LISTENER_MSG_TYPE_M_EVENT: 'MEVENT',

  /**
 * 监听消息类型----位置（物模型）
 * @type {string}
 */
  LISTENER_MSG_TYPE_M_LOCATION: 'LOCATION',

  /**
 *发送命令后，应答成功标志
 * @type {string}
 */
  CMD_ACK_STATUS_SUCCESS: 'succ'

}

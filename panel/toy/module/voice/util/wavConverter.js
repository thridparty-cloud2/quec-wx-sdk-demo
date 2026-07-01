/**
 * PCM → WAV 转换工具
 * 在 PCM 数据前拼接标准 44 字节 WAV header，写出临时文件并返回新路径
 *
 * @param {string} pcmFilePath  微信录音产生的 PCM 临时文件路径
 * @param {object} options      录音参数（需与录音时保持一致）
 *   - sampleRate      {number}  采样率，默认 24000
 *   - numChannels     {number}  声道数，默认 1
 *   - bitsPerSample   {number}  位深，默认 16
 * @returns {Promise<string>}   转换后的 WAV 临时文件路径
 */
function pcmToWav(pcmFilePath, options) {
  var sampleRate = (options && options.sampleRate) || 24000
  var numChannels = (options && options.numChannels) || 1
  var bitsPerSample = (options && options.bitsPerSample) || 16

  return new Promise(function (resolve, reject) {
    // 读取 PCM 文件
    wx.getFileSystemManager().readFile({
      filePath: pcmFilePath,
      success: function (res) {
        var pcmBuffer = res.data // ArrayBuffer

        // 构造 44 字节 WAV header
        var pcmByteLength = pcmBuffer.byteLength
        var wavBuffer = new ArrayBuffer(44 + pcmByteLength)
        var view = new DataView(wavBuffer)

        var byteRate = (sampleRate * numChannels * bitsPerSample) / 8
        var blockAlign = (numChannels * bitsPerSample) / 8

        // RIFF chunk
        writeString(view, 0, "RIFF")
        view.setUint32(4, 36 + pcmByteLength, true) // ChunkSize
        writeString(view, 8, "WAVE")

        // fmt sub-chunk
        writeString(view, 12, "fmt ")
        view.setUint32(16, 16, true) // Subchunk1Size (PCM = 16)
        view.setUint16(20, 1, true) // AudioFormat (PCM = 1)
        view.setUint16(22, numChannels, true)
        view.setUint32(24, sampleRate, true)
        view.setUint32(28, byteRate, true)
        view.setUint16(32, blockAlign, true)
        view.setUint16(34, bitsPerSample, true)

        // data sub-chunk
        writeString(view, 36, "data")
        view.setUint32(40, pcmByteLength, true) // Subchunk2Size

        // 拷贝 PCM 数据到 header 后面
        var pcmView = new Uint8Array(pcmBuffer)
        var wavView = new Uint8Array(wavBuffer)
        wavView.set(pcmView, 44)

        // 写出临时 WAV 文件
        var wavPath =
          wx.env.USER_DATA_PATH + "/clone_voice_" + Date.now() + ".wav"

        wx.getFileSystemManager().writeFile({
          filePath: wavPath,
          data: wavBuffer,
          success: function () {
            resolve(wavPath)
          },
          fail: function (err) {
            console.error("写出 WAV 文件失败", err)
            reject(err)
          },
        })
      },
      fail: function (err) {
        console.error("读取 PCM 文件失败", err)
        reject(err)
      },
    })
  })
}

/**
 * 向 DataView 的指定偏移写入 ASCII 字符串
 */
function writeString(view, offset, str) {
  for (var i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

module.exports = {
  pcmToWav: pcmToWav,
}

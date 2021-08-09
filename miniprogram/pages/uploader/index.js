// miniprogram/pages/uploader/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uploaders: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '上传图片',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  uploaderImage(){
    wx.chooseMedia({
      count: 9,
      sourceType: ['album'],
      success:(result)=>{
        console.log('uploader-result>>', result);
        const {tempFiles} = result;
        tempFiles.forEach((item,index)=>{
          if(!item.fileType){
            item.fileType = result.type
          }
          if(item.fileType && item.fileType == 'image' && item.size/1024 > 2048){
            wx.showToast({
              title: '请不要上传2M以上的图片或视频，我快没内存了',
              icon: 'none'
            })
            tempFiles.splice(index, 1)
          }
        })

        let uploaders = this.data.uploaders
        uploaders = uploaders.concat(tempFiles)
        this.setData({
          uploaders
        })
      }
    })
  },

  previewImage(ev){
    console.log('预览视频图片',ev);
    const {fileType} = ev.target.dataset;
    const {current} = ev.target.dataset
    let sources = this.data.uploaders
    sources.forEach(item=>{
      item.url = item.tempFilePath,
      item.type = item.fileType,
      item.poster = item.thumbTempFilePath
    })
    wx.previewMedia({
      sources: sources,
      current,
      success:(result)=>{
        console.log('预览图片>>',result);
      },
      fail:(errMsg)=>{
        console.log('预览失败>>',errMsg);
        wx.showToast({
          title: '预览失败',
        })
      },
    })
  },

  async startUploader(){
    let uploaders = this.data.uploaders;
    if(!uploaders.length){
      wx.showToast({
        title: '请先选择要的上传图片',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '正在上传，请耐心等待',
    })
    let timer = setTimeout(()=>{
      if(this.data.uploaders.length){
        wx.hideLoading()
        wx.showLoading({
          title: '数据有点大，正在努力上传中',
        })
      }
      clearTimeout(timer)
    }, 1000 * 5)
    let tasks = []
    
    let len = uploaders.length
    for (let i = 0; i < len; await i++) {
      let filePath = uploaders[i].tempFilePath;
      const name = Math.random() * 1000000;
      const cloudPath = `${name}`.replace(/\./g,'-') + filePath.match(/\.[^.]+?$/)[0]
      const fileType = uploaders[i].fileType
      tasks.push(
        new Promise((resolve, reject)=>[
        wx.cloud.uploadFile({
          filePath,
          cloudPath,
          success: (res) => {
            console.log('[上传图片] 成功：', res)
            console.log('index',i);
            let fileID = res.fileID;
            //把图片存到users集合表
            if(!wx.getStorageSync('openId')) return;
            wx.cloud.callFunction({
              name: 'updatabase',
              data:{
                openid:wx.getStorageSync('openId'),
                url: fileID,
                fileType: fileType
              },
              success: (result) => {
                console.log('保存图片到数据库', result)
                resolve({updatabase: result,uploadFile: res})
                let datas = this.data.uploaders;
                datas = datas.filter(item=>item.tempFilePath!=filePath)
                console.log('datas',datas);
                this.setData({
                  uploaders: datas
                })
              },
              fail: err => {
                console.error('保存图片到数据库失败', err)
                reject({updatabase: err})
              }
            })
          },
           fail: e => {
            console.error('[上传图片] 失败：', e)
            reject({uploadFile: e})
          },
        })
        ])
      )
    }
    Promise.all(tasks).then(result=>{
      console.log('全部执行完了result', result);
      wx.hideLoading()
    })
  },

    /**
     * @description: 控制循环休眠
     * @param  {*}
     * @return {*}
     * @param {*} time 休眠时间
     */    
    sleep(time = 3000){
      return new Promise((resolve)=>{
        timer = setTimeout(()=>{
          clearTimeout(timer)
          resolve(true)
        }, time)
      })
    },

  removeImage(ev){
    console.log('removeImage');
    const {current} = ev.target.dataset;
    let uploaders = this.data.uploaders;
    uploaders.splice(current, 1);
    console.log('uploaders',uploaders);
    this.setData({
      uploaders: uploaders
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
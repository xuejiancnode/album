
let animation = null
let imageList = []
let startMove = 0
let currentPreview = null
let lastPreview = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    images:[],
    currentDom: null,
    mediaAnimation: '',
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getImages()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showLoading({
      title: '资源加载中...',
    })
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

  getImages(){
    console.log("openid: wx.getStorageSync('openId')",wx.getStorageSync('openId'));
    wx.cloud.callFunction({
      name: 'getImages',
      data:{
        openid: wx.getStorageSync('openId')
      },
      success: result => {
        console.log(result.result.data);
        result.result.data.forEach(item=>{
          item.mediaClass = ''
          item.left = 0
          item.opacity = 1
        })
        this.setData({
          images: result.result.data
        })
      },
      fail: errMsg => {
        console.log(errMsg);
      },
      complete: res => {
        wx.hideLoading()
      }
    })
  },

  previewImage(ev){
    console.log('预览视频图片',ev);
    const {fileType} = ev.target.dataset;
    const {current} = ev.target.dataset
    let sources = this.data.images
    sources.forEach(item=>{
      item.url = item.url,
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

  videoPlay(){
    return
  },

  longpress(ev){
    console.log('ev',ev);
    const {filetype, current} = ev.target.dataset;
    console.log('fileType',filetype);
    let data = this.data.images[current]
    wx.showActionSheet({
      itemList: ['保存到本地','删除该资源'],
      success: (res) =>{
        console.log('showActionSheet', res);
        if(res.tapIndex == 0){
          wx.showLoading({
            title: '保存中...',
          })
          wx.cloud.downloadFile({
            fileID: data.url, // 文件 ID
            success: res => {
              // 返回临时文件路径
              console.log(res.tempFilePath,filetype)
              wx[filetype == 'image' ? "saveImageToPhotosAlbum" : 'saveVideoToPhotosAlbum']({
                filePath: res.tempFilePath,
                success: (result) =>{
                  wx.hideLoading()
                },
                complete: res => {
                  console.log('res',res);
                  wx.hideLoading()
                }
              })
            },
            fail: console.error
          })
        }else {
          wx.cloud.callFunction({
            name: 'removeImage',
            data:{
              id: data['_id']
            },
            success: result => {
              wx.showToast({
                title: '删除成功',
                icon: 'none'
              })
              let images = this.data.images
              images = images.filter(item=>item['_id']!=data['_id'])
              this.setData({
                images
              })
            }
          })
        }
      }
    })
  },

  /**
   * 开始触摸
   * @param {Object} ev event事件对象
   */
  touchStart(ev){
    console.log('touchStart',ev);
    imageList = this.data.images
    // animation = wx.createAnimation({
    //   duration: 1000,
    //   timingFunction: 'linear',
    // })
    startMove = ev.changedTouches[0].clientX
    this.setData({
      currentDom: ev.target.dataset.current,
    })
  },

  /**
   * 触摸滑动
   * @param {Object} ev event事件对象
   */
  touchMove(ev){
    if(startMove < ev.changedTouches[0].clientX){
      
      if(imageList[this.data.currentDom].left <= 80){
        imageList[this.data.currentDom].left += 5
        this.setData({
          images: imageList
        })
      }
    }else {
      if(imageList[this.data.currentDom].left > -80){
        imageList[this.data.currentDom].left -= 5
        this.setData({
          images: imageList
        })
      }
    }
    startMove = ev.changedTouches[0].clientX
  },
  /**
   * 滑动预览结束
   * @param {Object} ev event事件对象
   */
  touchEnd(ev){
    console.log('touchEnd',ev);
    animation = null;
    // imageList[this.data.currentDom].mediaClass = ''
    console.log('imageList[this.data.currentDom]',imageList,this.data.currentDom);
    if(imageList[this.data.currentDom].left > 40){
      let data = imageList[this.data.currentDom];
      data.left = 0
      imageList.splice(this.data.currentDom, 1)
      imageList.unshift(data)
    } else if(imageList[this.data.currentDom].left <= -40){
      console.log('else');
      imageList[this.data.currentDom].left = 0
      let data = imageList.shift();
      console.log('imageList',imageList);
      data.left = 0
      // imageList.splice(this.data.currentDom, 1)
      imageList.push(data)
    }else {
      imageList[this.data.currentDom].left = 0
    }
    console.log('imageList',imageList);
    // imageList[this.data.currentDom].left = 0
    this.setData({
      mediaAnimation: '',
      images: imageList
    })
    // imageList = []
  },

  /**
   * 触摸被打断
   * @param {Object} ev event事件对象
   */
  touchCancel(ev){
    // imageList[this.data.currentDom].left = 0
    this.setData({
      mediaAnimation: '',
      images: imageList
    })
    imageList = []
  },

  /**
   * 切换图片预览
   * @param {Object} ev event事件对象
   */
  changePreview(ev){
    const {type} = ev.target.dataset;
    let images = this.data.images
    currentPreview = images[images.length-1]
    lastPreview = images[0]
    let currentId = currentPreview['_id']
    let lastId = lastPreview['_id']
    if(type == 'pre'){
      images.forEach(async(item,index)=>{
        if(item['_id'] == currentId){
          let url = item.url
          item.left = -80
          item.opacity = 0
          item.url = ''
          this.setData({
            images
          })
          let timer = await setTimeout(()=>{
            item.left = 0
            item.opacity = 1
            item.url = url
            console.log('aaaaa');
            this.setData({
              images
            })
            clearTimeout(timer)
          },300)
        }if(lastId == item['_id']){
          let timer = await setTimeout(()=>{
            let data = images.shift()
            images.push(data)
            this.setData({
              images
            })
            clearTimeout(timer)
          },300)
        }
      })
    }else {
      lastPreview = images[images.length-2]
      console.log('lastPreview',lastPreview);
      lastId = lastPreview['_id']
      images.forEach(async(item,index)=>{
        if(item['_id'] == currentId){
          let url = item.url
          item.left = 80
          item.opacity = 0
          item.url = ''
          this.setData({
            images
          })
          let timer = await setTimeout(()=>{
            item.left = 0
            item.opacity = 1
            item.url = url
            this.setData({
              images
            })
            clearTimeout(timer)
          },300)
        }
        if(lastId == item['_id']){
          let timer = await setTimeout(()=>{
            let data = images.pop()
            images.unshift(data)
            this.setData({
              images
            })
            clearTimeout(timer)
          },300)
        }
      })
    }
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
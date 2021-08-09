//index.js
const app = getApp()
wx.cloud.init()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: null,
    logged: false,
    takeSession: false,
    requestResult: '',
  },

  onLoad: function() {
    wx.getSetting({
      success: (res)=>{
        console.log('getSetting',res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              console.log('getUserInfo',res.userInfo)
            }
          })
        }
      }
    })
    wx.setNavigationBarTitle({
      title: '用户',
    })
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    if(app.globalData.userInfo){
      console.log('app.globalData',app.globalData);
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    wx.showLoading({
      title: '加载用户信息',
    })
  },
  
  onReady(){
    wx.hideLoading()
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  getUserInfo() {
    wx.getUserProfile({
      lang: 'zh_CN',
      desc: '仅用做个人信息展示',
      success:(result)=>{
        console.log('getUserInfo',result);
        wx.showLoading({
          title: '登录中',
        })
        console.log('用户信息>>>',result);
        const {userInfo} = result;
        wx.setStorageSync('userInfo', userInfo)
        this.setData({
          userInfo
        })
        // 调用云函数
        wx.cloud.callFunction({
          name: 'login',
          data: {
            userInfo
          },
          success: res => {
            console.log('[云函数] [login] user openid: ', res.result.openid)
            wx.setStorageSync('openId', res.result.openid)
            wx.hideLoading()
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err)
          }
        })
      }
    })
    // // 调用云函数
    // wx.cloud.callFunction({
    //   name: 'login',
    //   data: {
    //     name:'薛建'
    //   },
    //   success: res => {
    //     console.log('[云函数] [login] user openid: ', res.result.openid)
    //     app.globalData.openid = res.result.openid
        
        
    //     wx.navigateTo({
    //       url: '../userConsole/userConsole',
    //     })
    //   },
    //   fail: err => {
    //     console.error('[云函数] [login] 调用失败', err)
    //     wx.navigateTo({
    //       url: '../deployFunctions/deployFunctions',
    //     })
    //   }
    // })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath: 'xj/' + cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  deleteDataBase:function(){
    wx.showModal({
      title: '清除资源数据',
      content: '确定要清除调吗？还是留一些回忆吧！！',
      success: result => {
        console.log('result',result);
        if(result.confirm) {
          wx.showLoading({
            title: '删除回忆..',
          })
          wx.cloud.callFunction({
            name:'removedatabase',
            data:{
              modelName:'x_file_id',
              openid: wx.getStorageSync('openId')
            },
            success:(res)=>{
              wx.hideLoading()
              console.log('清除成功',res)
              wx.showToast({
                title: '下次记录时要想起我哦！',
                icon: 'none'
              })
            },
            fail: (err) => {
              console.log('清除失败', err)
              wx.showToast({
                title: '就连服务器都不舍得你删除，再想想吧！！',
              })
            }
          })
        } if(result.cancel) {
          wx.showToast({
            title: '吓死我了，以为你真删呢',
            icon: 'none'
          })
        }
      }
    })
  },
  getDataBase(){
    wx.cloud.callFunction({
      name: 'getdatabase',
      data: {
        modelName: 'counters',
        id:'8a6c3bf65f48b08e006fb18c6df8603e'
      },
      success: (res) => {
        console.log('获取数据成功', res)
      },
      fail: (err) => {
        console.log('获取数据成功失败', err)
      }
    })
  },
  upDataBase(){
    wx.cloud.callFunction({
      name: 'updatabase',
      data: {
        modelName: 'counters',
        id: '8a6c3bf65f48b08e006fb18c6df8603e',
        name:'a'
      },
      success: (res) => {
        console.log('修改数据成功', res)
      },
      fail: (err) => {
        console.log('修改数据失败', err)
      }
    })
  },
  toPage(ev){
    console.log('toPage',ev);
    const {url} = ev.target.dataset;
    wx.navigateTo({
      url: `/pages/${url}/index`,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})

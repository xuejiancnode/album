//app.js
App({
  onLaunch () {
    console.log("wx.getStorageSync('userInfo')",wx.getStorageSync('userInfo'));
    // if(wx.getStorageSync('userInfo')){
    //   this.globalData.userInfo = wx.getStorageSync('userInfo')
    // }
  },
  globalData:{
    userInfo: wx.getStorageSync('userInfo')
  }
})

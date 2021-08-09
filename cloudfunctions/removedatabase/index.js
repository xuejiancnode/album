/**
 * 删除表数据
 */ 

const cloud = require('wx-server-sdk')
const init = cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event,context) =>{
  let {modelName,openid} = event

  try{
    return await db.collection(modelName).where({
      isDelete: _.gte(0),
      openid: openid
    }).get().then(res=>{
      db.collection(modelName).where({
        isDelete: _.gte(0),
        openid: openid
      }).remove()
      let fileList = []
      res.data.forEach(item=>{
        fileList.push(item.url)
      })
      cloud.deleteFile({
        fileList,
        success: res => {
          // handle success
          console.log(res.fileList)
        },
        fail: errMsg => {
          console.log(errMsg)
        }
      })
    })
  }catch(e){
    console.log(e)
  }
}
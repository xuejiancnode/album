/**
 * 获取图片数据
 */ 

const cloud = require('wx-server-sdk')
const init = cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event,context) =>{
  let openid = event.openid
  try{
    return await db.collection('x_file_id').where({
      openid,
      isDelete: _.lt(1)
    }).get().then(res=>{
      console.log(res.data)
      return {
        data:res.data
      }
    })
  }catch(e){
    console.log(e)
  }
}
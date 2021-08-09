/**
 * 上传图片
 */ 

const cloud = require('wx-server-sdk')
const init = cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event,context) =>{
  let {openid,url,fileType} = event
  let returnData = null;
  try{
    await db.collection('x_file_id').add({
      data: {
        url,
        openid,
        fileType,
        isDelete: 0
      },
      success:(res)=>{
        console.log('上传成功>>>',res);
        returnData = {
          code: 200,
          msg: '上传成功'
        }
      },
      fail:(errMsg)=>{
        console.log('上传失败>>>',errMsg);
        returnData = {
          code: 400,
          msg: '上传失败'
        }
      }
    })
    return returnData
  }catch(e){
    console.log(e)
    return {
      code: 500,
      msg: '服务器错误'
    }
  }
}
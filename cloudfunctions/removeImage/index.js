/**
 * 删除图片数据
 */ 

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
exports.main = async (event,context) =>{
  let id = event.id
  try{
    return await db.collection('x_file_id')
    .doc(id)
    .get().then(res=>{
        let data = res.data
        db.collection('x_file_id')
        .doc(id).remove()
        cloud.deleteFile({
            fileList: [res.data.url],
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
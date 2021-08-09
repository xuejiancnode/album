/**
 * 删除表数据
 */ 

const cloud = require('wx-server-sdk')
const init = cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event,context) =>{
  let modelName = event.modelName
  let id = event.id
  try{
    return await db.collection(modelName).where({
      '_id': id,//'7498b5fe5f48aa700089ebec7a3ae91b'
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
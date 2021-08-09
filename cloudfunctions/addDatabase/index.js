// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var filedvalue1 = event.data1
  var filedvalue2 = event.data2
  console.log('', event)
  let param = {}
  for (let key in event){
    param[key] = event[key]
  }

  try {
    return await db.collection('x_user_info').add({
      data: param
    })
  } catch (e) {
    console.log(e)
  }
}
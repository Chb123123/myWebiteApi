// 删除多余的头像图片
const db = require('../mysqlFrom/index')
const fs = require("fs");
const path = require('path')

const filePath = __dirname.replace('\\util', '')
const imgUrl = path.join(filePath, '/images/userPic')

// 查询所有用户头像列表
const sqlStr = 'select user_Pic from userInfo'
db.query(sqlStr, (err, results) => {
  if(err) return console.log(err)
  let userPicList = []
  for (let item of results) {
    if(item.user_Pic) {
      userPicList.push(item.user_Pic.split('\/userPic/')[1])
    }
  }
  fs.readdir(imgUrl, (err, results) => {
    if (err) return console.log(err)
    let flag = true
    for(let i of results) {
      for(let j of userPicList) {
        if(i === j) {
          console.log('图片相同', j)
          flag = false
          break
        }
      }
      if(flag) {
        if(i !== 'default.webp') {
          fs.unlink(`${imgUrl}/${i}`, function(err, results) {
            if(err) return console.log('删除图片失败')
            console.log('删除图片成功')
          })
        }
      }
      flag = true
    }
    return results
  })
})

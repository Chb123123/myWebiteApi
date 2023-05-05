// 通过接口获取相应的数据 下载获取的图片

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const request = require('request')
const db = require('../mysqlFrom/index')

let list = []
let flag = true
let num = 630
function main() {
  console.log(num)
  axios.get(`https://api.apiopen.top/api/getImages?page=${num}&size=20`).then(res => {
    if (res.data.code === 200) {
      list = res.data.result.list
      if (list.length < 20) {
        flag = false
      }
      getList(list)
    } else {
      console.log('获取图片列表错误')
    }
  })
}

// 获取图片列表，将图片写入到文件夹
async function getList(list) {
  for (let item of list) {
    let url = item.url
    let len = url.split('.').length - 1
    let flie = url.split('.')[len]
    let filename = `${+new Date()}.${flie}`
    await sleep(1800)
    console.log(url)
    request({ url }).pipe(
      fs.createWriteStream(`../images/viewsImg/${filename}`)
        .on('close', function (err) {
          if (err) {
            console.log('图片下载失败')
            return
          }
          console.log('图片下载成功')
          console.log(item)
          const sqlStr = 'INSERT INTO viewimg SET title = ?, url = ?, TYPE = ?'
          db.query(sqlStr, [item.title, `/images/viewsImg/${filename}`, item.type], (err, results) => {
            if(err) return console.log(err)
            if(results.affectedRows !== 1) return console.log('写入数据失败')
            console.log('写入数据成功')
          })
        })
    )
  }
  if (flag) {
    num++
    console.log('文件读取完成')
    // 图片读取下载完成，获取下一批图片
    main()
  } else {
    console.log('图片爬取完成')
    return
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
main()

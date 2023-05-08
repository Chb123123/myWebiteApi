// 获取新的图片

let requests = require('requests') // 请求包
let fs = require('fs') // 读写文件
const request = require('request')

requests(`https://www.csdn.net/`, { encoding: 'utf8' }) // 请求路径
  .on('data', async function (chunk) {
    let reg1 = /<img(?:(?!\/>).|\n)*?>/gm
    const arr = chunk.match(reg1)
    console.log(arr)
    let reg2 = /src=[\'\"]?([^\'\"]*)[\'\"]?/i
    for(let item of arr) {
      if(item.match(reg2)) {
        let url = item.match(reg2)[1]
        let filename = `${+new Date()}.${url.split('.')[url.split('.').length - 1]}`
        await sleep(1000)
        request({ url }).pipe(
          fs.createWriteStream(`../images/img/${filename}`)
            .on('close', function (err) {
              if (err) {
                console.log(`${url}: 图片下载失败！！！`)
                return
              }
              console.log(`${url}: 图片下载成功`)
            })
        )
      }
    }
  })


  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
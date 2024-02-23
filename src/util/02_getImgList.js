/**
 * 该脚本爬取的是 彼岸图网 首页数据
 * 通过网页数据筛选出需要的图片
 */

let requests = require('requests') // 请求包
let fs = require('fs') // 读写文件
const request = require('request')

let num = 5
function main() {
  num++
  console.log(`当前在${num}页`)
  requests(`https://pic.netbian.com/index_${num}.html`, { encoding: 'utf8' }) // 请求路径
    .on('data', async function (chunk) {
      const list = chunk.split('href="')
      list.splice(0, 1)
      list.splice(list.length - 1, 1)
      for (let item of list) {
        if (item.indexOf('.html') !== -1) {
          let hrefItem = item.slice(0, item.indexOf('.html') + 5)
          if (hrefItem.slice(1).indexOf('/') !== -1) {
            await sleep(1800)
            requests(`https://pic.netbian.com${hrefItem}`).on('data', async function (data) {
              const list = data.split('photo-pic')[1]
              let url = `https://pic.netbian.com${list.split('src="')[1].split('"')[0]}`
              let file = url.split('.')
              let filename = `${+new Date()}.${file[file.length - 1]}`
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
            })
          }
        }
      }
      console.log('当前页面图片获取完成, 即将获取新页面图片')
      // 开始一张页面
      main()
    })
}

main()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

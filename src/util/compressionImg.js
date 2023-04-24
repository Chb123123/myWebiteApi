const gm = require('gm')
const fs = require("fs");
const path = require('path')
const filePath = __dirname.replace('\\util', '')
const imgUrl = path.join(filePath, '/images/viewsImg/1681703152863.jpg')
const imgUrl1 = path.join(filePath, '/images/compressionViewImg/1681703152863.jpg')
// 1681703152863.jpg
// fs.readdir(imgUrl, (err, results) => {
//   if (err) return console.log(err)
//   console.log(results)
// })
console.log(imgUrl)
console.log(imgUrl1)
gm('../images/viewsImg/1681703152863.jpg')
  .resize(50,50,"!")     //设置压缩后的w/h
  .write('../images/compressionViewImg/1681703152863.jpg',
    function (err) { console.log("err: " + err); })
//2, 获取图片尺寸
// gm("图片路径").size(function (err, value) { });
// //3, 获取图片大小
// gm("图片路径").filesize(function (err, value) { })
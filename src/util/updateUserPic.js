const multer = require("multer")

const storage = multer.diskStorage({
  // 存储位置 
  destination: function (req, file, callback) {
    // 参数解释 param1:错误信息  param2:上传图片的服务端保存路径，注意这里的路径写法
    callback(null, "../images/userPic")
  },
  // 确定文件名,在这儿采用了时间戳和图片文件原名为上传的图片文件命名，可以保证名字不重复
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})
// 得到multer对象
const upload = multer({ storage: storage })
// console.log(upload)
module.exports = upload

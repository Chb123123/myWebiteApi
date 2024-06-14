const fs = require("fs");
var formidable = require("formidable");

// 上传文章图片
exports.uploadImg = (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, files) {
    if(!files.file) return res.cc('上传的图片不存在')
    let fileType = files.file.originalFilename.split(".")
    let type = fileType[fileType.length - 1]
    let imgType = ["jpg","png","gif","psd","tiff","BMP","eps","svg","jpeg"]
    let flag = imgType.some(item => {
      if(type === item) {
        return true
      }
    })
    if(!flag) return res.cc('上传的图片类型不存在')
    if (error) return res.cc('上传失败')
    // var fullFileName = `${+new Date}-${files.file.originalFilename}`;// 拼接图片名称：时间戳-图片名称
    var fullFileName = `${+new Date}.${type}`;// 拼接图片名称：时间戳
    fs.writeFileSync(`${res.path}/src/images/article/${fullFileName}`, fs.readFileSync(files.file.filepath)); // 存储图片到public静态资源文件夹下
    let imgInfo = {
      name: files.file.originalFilename,
      location: `${res.website}/images/article/${fullFileName}`
    }
    res.send({
      status: 1,
      message: '上传成功',
      location: `${res.website}/images/article/${fullFileName}`
    })
  });
}


// 上传文章图片
exports.uploadSystemImg = (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, files) {
    if(!files.file) return res.send({
      error: 1,
      message: '上传的图片为空'
    })
    let fileType = files.file.originalFilename.split(".")
    let type = fileType[fileType.length - 1]
    let imgType = ["jpg","png","gif","psd","tiff","BMP","eps","svg","jpge",]
    let flag = imgType.some(item => {
      if(type === item) {
        return true
      }
    })
    if(!flag) return res.send({
      error: 1,
      message: '上传的图片类型不存在'
    })
    if (error) return res.send({
      error: 1,
      message: '上传失败'
    })
    // var fullFileName = `${+new Date}-${files.file.originalFilename}`;// 拼接图片名称：时间戳-图片名称
    var fullFileName = `${+new Date}.${type}`;// 拼接图片名称：时间戳
    fs.writeFileSync(`${res.path}/src/images/article/${fullFileName}`, fs.readFileSync(files.file.filepath)); // 存储图片到public静态资源文件夹下
    res.send({
      errno: 0, // 0表示成功，其他数据表示失败
      message: '上传成功',
      data: {
        url: `${res.website}/images/article/${fullFileName}`,
        alt: files.file.originalFilename
      }
    })
  });
}

/**
 * @api {post} /my/upload/img 上传图片
 * @apiName registerUser
 * @apiGroup upload
 * 
 * @apiParam file 上传的文件流
 * 
 * @apiSuccess {Number} status 返回的状态码 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
*/


// 上传文章图片
exports.uploadFile = (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, files) {
    if(!files.file) return res.cc('上传的文件不存在')
    if (error) return res.cc('上传失败')
    var fullFileName = `${+new Date}-${files.file.originalFilename}`;// 拼接图片名称：时间戳-图片名称
    fs.writeFileSync(`${res.path}/src/images/files/${fullFileName}`, fs.readFileSync(files.file.filepath)); // 存储图片到public静态资源文件夹下
    res.send({
      status: 1,
      message: '上传成功',
      location: `${res.website}/images/files/${fullFileName}`  // 图片网络地址
    })
  });
}

/**
 * @api {post} /my/upload/file 上传文件
 * @apiName registerUser
 * @apiGroup upload
 * 
 * @apiParam file 上传的文件流
 * 
 * @apiSuccess {Number} status 返回的状态码 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
*/
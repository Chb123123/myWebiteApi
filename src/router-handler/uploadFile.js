const fs = require("fs");
var formidable = require("formidable");

// 上传文章图片
exports.uploadImg = (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, files) {
    if(!files.file) return res.cc('上传的图片不存在')
    if (error) return res.cc('上传失败')
    var fullFileName = `${+new Date}-${files.file.originalFilename}`;// 拼接图片名称：时间戳-图片名称
    fs.writeFileSync(`${res.path}/src/images/article/${fullFileName}`, fs.readFileSync(files.file.filepath)); // 存储图片到public静态资源文件夹下
    res.send({
      status: 1,
      message: '上传成功',
      location: `${res.website}/images/article/${fullFileName}`  // 图片网络地址
    })
  });
}

const db = require('../mysqlFrom/index')
const formatTime = require('silly-datetime')
const fs = require("fs");
var formidable = require("formidable");

// 主页 Tab 栏
exports.getHomeTab = (req, res) => {
  let sqlStr = 'select * from homeTable'
  db.query(sqlStr, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('数据不存在')
    res.send({
      status: 1,
      message: '成功',
      queryData: results
    })
  })
}

/**
 * @api {get} /api/gethomeTable 首页table栏信息
 * @apiName getHomeTable
 * @apiGroup Home
 * 
 * @apiSuccess {Number} status 请求状态 1 表示请求成功， 0 表示请求失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 请求数据
 * 
*/

// 首页轮播图
exports.getHomeFouseMap = (req, res) => {
  let sqlStr = 'select id, imgUrl, imgText from mapTable where userId = ?'
  db.query(sqlStr, parseFloat(req.query.userId), (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) res.cc('不存在图片')
    res.send({
      status: 1,
      message: '成功',
      queryData: results
    })
  })
}

/**
 * @api {get} /api/getHomeFouseMap 获取用户设置的轮播图
 * @apiName getHomeFouseMap
 * @apiGroup Home
 * 
 * @apiParam userId 登入用户的id
 * 
 * @apiSuccess {Number} status 状态请求码
 * @apiSuccess {String} message 请求说明
 * 
*/

// 用户发布文章
exports.releaseArticle = (req, res) => {
  let addData = req.body
  res.estimate(addData, ['userId', 'article', 'title'])
  let sqlStr = "INSERT INTO userArticle SET userid = ?, article = ?, title=?, TIME = ?"
  let newTime = formatTime.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
  db.query(sqlStr, [parseInt(addData.userId), addData.article, addData.title, newTime], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) {
      res.cc('发布文章失败')
      return
    }
    res.cc('发布成功', 1)
  })
}

/**
 * @api {post} /api/releaseArticle 用户发布文章接口
 * @apiName releaseArticle
 * @apiGroup Article
 * 
 * @apiParam {Number} userId 用户id
 * @apiParam {String} article 用户发布的文章
 * @apiParam {String} title 文章标题
 * 
 * @apiSuccess {Number} status 请求状态码
 * @apiSuccess {String} message 请求说明
*/

// 修改文章
exports.updataArticle = (req, res) => {
  let info = req.body
  res.estimate(info, ['userId', 'article', 'title', 'articleId'])
  const sqlStr = "UPDATE userArticle SET article = ?, title = ? WHERE articleId = ? AND userId = ?"
  db.query(sqlStr, [info.article, info.title, parseInt(info.articleId), parseInt(info.userId)], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('修改文章失败')
    res.cc(1, '修改文章成功')
  })
}

/**
 * @api {post} /api/updataArticle 修改已发布文章
 * @apiName updataArticle
 * @apiGroup Article
 * 
 * @apiParam {Number} userId 用户id
 * @apiParam {String} article 修改后的文章内容
 * @apiParam {Number} articleId 文章Id
 * @apiParam {String} title 修改后的文章标题
 * 
 * @apiSuccess {Number} status 请求状态码
 * @apiSuccess {String} message 请求说明
*/

// 删除文章
exports.reomveArticle = (req, res) => {
  let userInfo = req.body
  if (!userInfo.userId || !userInfo.articleId) {
    return res.cc('缺少必要参数')
  }
  let sqlStr = 'DELETE FROM userArticle WHERE userId = ? AND articleId = ?'
  db.query(sqlStr, [parseInt(userInfo.userId), parseInt(userInfo.articleId)], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('删除文章失败')
    res.cc(1, '删除文章成功')
  })
}

/**
 * @api {delete} /api/reomveArticle 用户发布文章接口
 * @apiName reomveArticle
 * @apiGroup Article
 * 
 * @apiParam {Number} userId 用户id
 * @apiParam {Number} articleId 文章id
 * 
 * @apiSuccess {Number} status 请求状态码
 * @apiSuccess {String} message 请求说明
*/

// 上传文章图片
exports.uploadImg = (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, files) {
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


// 获取文章列表
exports.getArticleList = (req, res) => {
  const info = req.query
  if (!info.userId) return res.cc('缺少用户Id')
  if (info.page || info.size) {
    const sqlStr = 'SELECT u.userId, u.article, u.articleId, u.title, u.time, i.user_pic, i.userName FROM userArticle AS u INNER JOIN userInfo AS i WHERE u.userId = i.userId AND u.userId = ? ORDER BY u.articleId DESC LIMIT ?,?'
    db.query(sqlStr, [parseInt(info.userId), (parseInt(info.page) * parseInt(info.size)), parseInt(info.size)], (err, results) => {
      if(err) return res.cc(err)
      if(results.length <= 0) return res.cc('获取文章数据为空')
      res.send({
        status: 1,
        message: '获取文章列表成功',
        queryData: results
      })
    })
  } else {
    const sqlStr = 'SELECT u.userId, u.article, u.articleId, u.title, u.time, i.user_pic, i.userName FROM userArticle AS u INNER JOIN userInfo AS i WHERE u.userId = i.userId AND u.userId = ? ORDER BY u.articleId DESC'
    db.query(sqlStr, parseInt(info.userId), (err, results) => {
      if (err) return res.cc(err)
      if (results.length <= 0) return res.cc('获取文章列表失败')
      res.send({
        status: 1,
        message: '获取文章列表成功',
        queryData: results
      })
    })
  }

}

/**
 * @api {get} /api/getArticleList 获取文章列表
 * @apiName getArticleList
 * @apiGroup Article
 * 
 * @apiParam {Number} [page] 页号
 * @apiParam {Number} [size] 数量
 * @apiParam {Number} userId 用户id
 * 
 * @apiSuccess {Number} status 请求状态码
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 返回的图片列表
*/


// 获取作品列表
exports.getWordsList = (req, res) => {
  const info = req.query
  const sqlStr = 'SELECT p.id, p.worksTitle, p.introduction, p.platform, p.wordsAddress, p.time, i.user_pic, i.userName FROM portfolio AS p INNER JOIN userInfo AS i WHERE p.userId = i.userId ORDER BY p.id DESC LIMIT ?, ?'
  db.query(sqlStr, [parseInt(info.page) * parseInt(info.size), parseInt(info.size)], (err, results) => {
    if(err) return res.cc(err)
    res.send({
      status: 1,
      message: '成功',
      queryData: results
    })
  })
}

/**
 * @api {get} /api/getWordsList 获取作品列表
 * @apiName getWordsList
 * @apiGroup works
 * 
 * @apiParam {Number} page 页数
 * @apiParam {Number} size 每页数量
 * 
 * @apiSuccess {Number} status 请求状态 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 请求数据
*/

// 获取用户发布的作品列表
exports.getUserWorks = (req, res) => {
  const info = req.query
  const sqlStr = 'SELECT p.id, p.worksTitle, p.introduction, p.platform, p.wordsAddress, p.time, i.user_pic, i.userName FROM portfolio AS p INNER JOIN userInfo AS i WHERE p.userId = i.userId and p.userId = ? ORDER BY p.id DESC LIMIT ?, ?'
  db.query(sqlStr, [parseInt(info.userId), parseInt(info.page) * parseInt(info.size), parseInt(info.size)], (err, results) => {
    if(err) return res.cc(err)
    res.send({
      status: 1,
      message: '成功',
      queryData: results
    })
  })
}
/**
 * @api {get} /api/getUserWorks 获取用户发布的作品列表
 * @apiName getUserWorks
 * @apiGroup works
 * 
 * @apiParam {Number} userId 用户id
 * @apiParam {Number} page 页数
 * @apiParam {Number} size 每页数量
 * 
 * @apiSuccess {Number} status 请求状态 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 请求数据
*/

// 发布作品集 
exports.releaseWorks = (req, res) => {
  const info = req.body
  const sqlStr = 'INSERT INTO portfolio SET worksTitle = ?, platform = ?, userId = ?, wordsAddress = ?, introduction = ?,  TIME = ?'
  let newTime = formatTime.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
  db.query(sqlStr, [info.title, parseInt(info.platform), parseInt(info.userId), info.wordsAddress, newTime], (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows !== 1) res.cc('新增作品失败')
    res.send({
      status: 1,
      message: '成功'
    })
  })
}

/**
 * @api {Post} /api/releaseWorks 发布作品集
 * @apiName releaseWorks
 * @apiGroup works
 * 
 * @apiParam {Number} userId 发布作者
 * @apiParam {String} title 作品标题
 * @apiParam {Number} platform 显示平台
 * @apiParam {String} wordsAddress 作品链接
 * @apiParam {String} introduction 作品简介
 * 
 * @apiSuccess {Number} status 请求状态 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 请求数据
*/

// 删除用户作品
exports.removeWorks = (req, res) => {
  const info = req.body
  const sqlStr = 'DELETE FROM portfolio WHERE userId = ? AND id = ?'
  db.query(sqlStr, [parseInt(info.userId), parseInt(info.id)], (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows !== 1) return res.cc('删除文章失败')
    res.send({
      status: 1,
      message: '删除成功'
    })
  })
}

/**
 * @api {delete} /api/removeWorks 删除用户作品
 * @apiName removeWorks
 * @apiGroup works
 * 
 * @apiParam {Number} userId 发布作者
 * @apiParam {Number} id 作品id
 * 
 * @apiSuccess {Number} status 请求状态 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
*/
const db = require('../mysqlFrom/index')
const formatTime = require('silly-datetime')
const fs = require("fs");
var formidable = require("formidable");
const jwt = require('jsonwebtoken')
const secret = require('../config.js')

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
 * @apiParams userId 登入用户的id
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
 * @apiGroup Home
 * 
 * @apiParams {Number} userId 用户id
 * @apiParams {String} article 用户发布的文章
 * @apiParams {String} title 文章标题
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
 * @apiGroup Home
 * 
 * @apiParams {Number} userId 用户id
 * @apiParams {String} article 修改后的文章内容
 * @apiParams {Number} articleId 文章Id
 * @apiParams {String} title 修改后的文章标题
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
 * @apiGroup Home
 * 
 * @apiParams {Number} userId 用户id
 * @apiParams {Number} articleId 文章id
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
    const sqlStr = 'SELECT u.userId, u.article, u.articleId, u.title, u.time, i.user_pic, i.userName FROM userArticle AS u INNER JOIN userInfo AS i WHERE u.userId = i.userId AND u.userId = ? ORDER BY u.time DESC LIMIT ?,?'
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
    const sqlStr = 'SELECT u.userId, u.article, u.articleId, u.title, u.time, i.user_pic, i.userName FROM userArticle AS u INNER JOIN userInfo AS i WHERE u.userId = i.userId AND u.userId = ? ORDER BY u.time DESC'
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
 * @apiGroup Home
 * 
 * @apiParams {Number} [page] 页号
 * @apiParams {Number} [size] 数量
 * @apiParams {Number} userId 用户id
 * 
 * @apiSuccess {Number} status 请求状态码
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 返回的图片列表
*/

// 获取页面图片列表
exports.getViewImage = (req, res) => {
  let sqlStr = 'select * from viewImg limit ?, ?'
  let info = req.query
  if (!info.type) {
    let total = 0
    let getTypeCount = 'select count(*) as total from viewImg'
    db.query(getTypeCount, (err, results) => {
      if (err) return res.cc(err)
      if (results.length === 0) return res.cc('查询数据失败')
      total = results[0].total
      db.query(sqlStr, [(parseInt(info.page) * parseInt(info.size)), parseInt(info.size)], (err, results) => {
        if (err) return res.cc(err)
        if (results.length === 0) return res.cc('图片数据不存在')
        res.send({
          status: 1,
          message: '成功',
          queryData: {
            total: total,
            results: results
          }
        })
      })
    })
  } else {
    let total = 0
    let getTypeCount = 'select count(*) as total from viewImg where type = ?'
    db.query(getTypeCount, info.type, (err, results) => {
      if (err) return res.cc(err)
      if (results.length === 0) return res.cc('查询数据失败')
      total = results[0].total
      let sqlStr1 = 'select * from viewImg where type = ? limit ?, ?'
      db.query(sqlStr1, [info.type, (parseInt(info.page) * parseInt(info.size)), parseInt(info.size)], (err, results) => {
        if (err) return res.cc(err)
        if (results.length === 0) return res.cc('图片数据不存在')
        res.send({
          status: 1,
          message: '成功',
          queryData: {
            total: total,
            results: results
          }
        })
      })
    })
  }
}

/**
 * @api {get} /api/getViewImage 获取页面图片列表
 * @apiName getViewImage
 * @apiGroup Home
 * 
 * @apiParams {Number} page 页号
 * @apiParams {Number} size 数量
 * @apiParams {String} type 图片类型
 * 
 * @apiSuccess {Number} status 请求状态码
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 返回的图片列表
*/
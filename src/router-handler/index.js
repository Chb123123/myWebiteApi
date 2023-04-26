const db = require('../mysqlFrom/index')
var formidable = require("formidable");
const fs = require("fs");
// 加密数据
const bcrypt = require('bcryptjs')

// 生成token 的包
const jwt = require('jsonwebtoken')
const config = require('../config.js')

// 注册功能
exports.registerUser = (req, res) => {
  const userInfo = req.body
  // 判断用户名是否存在
  const isUserName = 'select accountNumber from userInfo where accountNumber = ?'
  db.query(isUserName, userInfo.accountNumber, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 0) return res.cc('账号已存在')
    // 将密码进行加密
    userInfo.password = bcrypt.hashSync(userInfo.password, 10)
    const sqlStr = 'insert into userInfo set accountNumber = ?, password = ?'
    db.query(sqlStr, [userInfo.accountNumber, userInfo.password], (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) res.cc('注册用户失败，请重试！')
      res.send({
        status: 1,
        message: '注册用户成功'
      })
    })
  })

}

/**
 * @api {post} /my/registerUser 注册用户
 * @apiName registerUser
 * @apiGroup user
 * 
 * @apiParam accountNumber 注册的账号
 * @apiParam password 注册用户的密码
 * 
 * @apiSuccess {Number} status 返回的状态码 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
*/

// 判断用户账号是否存在
exports.userIsExist = (req, res) => {
  const accountNumber = req.query.accountNumber
  const sqlStr = 'select accountNumber from userInfo where accountNumber = ?'
  db.query(sqlStr, accountNumber, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 0) return res.cc('账号已存在')
    res.send({
      status: 1,
      message: '账号通过'
    })
  })
}

/**
 * @api {get} /my/userIsExist 判断账号是否存在
 * @apiName userIsExist
 * @apiGroup user
 * 
 * @apiParam accountNumber 注册的账号
 * 
 * @apiSuccess {Number} status 返回的状态码
 * @apiSuccess {String} message 请求说明
*/


// 登入功能
exports.loginFunction = (req, res) => {
  const userInfo = req.body
  const sqlStr = 'select * from userInfo where accountNumber = ?'
  db.query(sqlStr, [userInfo.accountNumber], (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('账号不存在')
    const compareResult = bcrypt.compareSync(req.body.password, results[0].password)
    if (compareResult) {
      // 生成 token
      const userInfo = { ...results[0], password: '', user_pic: '' }
      const tokenStr = jwt.sign(userInfo, config.jwtSecretKey, {
        expiresIn: '24h'
      })
      res.send({
        status: 1,
        message: '登入成功',
        token: 'Bearer ' + tokenStr
      })
    } else {
      res.cc('密码错误')
    }
  })
}
/**
 * @api {get} /my/loginFunction 用户信息
 * @apiName loginFunction
 * @apiGroup user
 * 
 * @apiParam accountNumber 账号
 * @apiParam password 密码
 * 
 * @apiSuccess {Number} status 请求状态 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 返回的数据
*/


// 获取用户信息
exports.getUserInfo = (req, res) => {
  const userInfo = req.query
  const sqlStr = 'select userName, userId, user_pic, user_signature, accountNumber from userInfo where userId = ? and accountNumber = ?'
  db.query(sqlStr, [parseFloat(userInfo.userId), userInfo.accountNumber], (err, results) => {
    if (err) return res.cc(err)
    if (results.length < 1) return res.cc('用户不存在')
    res.send({
      status: 1,
      message: '获取用户信息成功！',
      queryData: results[0],
    })
  })
}

/**
 * @api {get} /api/getUserInfo 用户信息
 * @apiName getUserInfo
 * @apiGroup user
 * 
 * @apiSuccess {Number} status 请求状态 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 返回的数据
*/

// 获取用户首页列表
exports.getUserIndex = (req, res) => {
  const sqlStr = 'select * from userIndex'
  db.query(sqlStr, (err, results) => {
    if (err) return res.cc(err)
    res.send({
      status: 1,
      message: '成功',
      queryData: results
    })
  })
}

/**
 * @api {get} /api/userIndex 获取用户首页 tab 栏
 * @apiName userIndex
 * @apiGroup user
 * 
 * @apiSuccess {Number} status 请求状态 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 返回的数据
*/

exports.getTableInfo = (req, res) => {
  const sqlStr = 'select * from tableinfo where belongTable = ?'
  db.query(sqlStr, req.query.tableText, (err, results) => {
    if (err) return res.cc(err, 1)
    if (results.length === 0) return res.cc('内容不存在', 0)
    res.send({
      ststus: 1,
      message: '成功',
      queryData: results
    })
  })
}

/**
 * @api {get} /api/tableInfo 获取table内容
 * @apiName tableCenter
 * @apiGroup user
 * 
 * @apiParam {String} tableText table栏标签
 * 
 * @apiSuccess {Number} status 请求状态 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 返回的数据
*/

// 修改用户签名
exports.updataSignature = (req, res) => {
  const userInfo = req.body
  const sqlStr = 'update userInfo set user_signature = ? where userId = ?'
  let sqlStr1 = 'select * from userInfo where userId = ?'
  // 判断用户id是否存在
  db.query(sqlStr1, parseInt(userInfo.userId), (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('用户不存在')
    db.query(sqlStr, [userInfo.signature, parseInt(userInfo.userId)], (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('修改用户名失败')
      res.cc('修改用户名成功', 1)
    })
  })

}

/**
 * @api {post} /api/updataSignature 修改用户签名
 * @apiName updataSignature
 * @apiGroup user
 * 
 * @apiParams {Number} userId 用户id
 * @apiParams {String} signature 用户签名
 * 
 * @apiSuccess {Number} status 请求状态码
 * @apiSuccess {String} message 请求说明
*/

// 修改用户昵称
exports.updataUserName = (req, res) => {
  const user = req.body
  const sqlStr = 'update userInfo set userName = ? where userId = ?'
  db.query(sqlStr, [user.userName, parseInt(user.userId)], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('修改名称失败')
    res.send({
      status: 1,
      message: '成功'
    })
  })
}

/**
 * @api {post} /api/updataUserName 修改用户名称
 * @apiName updataUserName
 * @apiGroup user
 * 
 * @apiParams {Number} userId 用户id
 * @apiParams {String} userName 用户名
 * 
 * @apiSuccess {Number} status 请求状态码
 * @apiSuccess {String} message 请求说明
*/

// 修改用户密码
exports.updataPassword = (req, res) => {
  const user = req.body
  const sql = 'select password from userInfo where userId = ?'
  db.query(sql, parseInt(user.userId), (err, results) => {
    if (err) return res.cc(err)
    if (results.length <= 0) return res.cc('账号不存在')
    const compareResult = bcrypt.compareSync(req.body.oldPassword, results[0].password)
    if (!compareResult) return res.cc('旧密码错误')
    // 旧密码正确 修改用户密码
    user.newPassword = bcrypt.hashSync(user.newPassword, 10)
    const sqlStr = 'update userInfo set password = ? where userId = ?'
    db.query(sqlStr, [user.newPassword, parseInt(user.userId)], (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('修改密码失败')
      res.send({
        status: 1,
        message: '修改密码成功'
      })
    })
  })
}

/**
 * @api {post} /api/updataPassword 修改用户密码
 * @apiName updataPassword
 * @apiGroup user
 * 
 * @apiParams {Number} userId 用户id
 * @apiParams {String} oldPassword 旧密码
 * @apiParams {String} newPassword 新密码
 * 
 * @apiSuccess {Number} status 请求状态码
 * @apiSuccess {String} message 请求说明
*/

// 上传用户头像
exports.uploadUserPic = (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, files) {
    if (error) return res.cc('上传失败')
    var fullFileName = `${+new Date}-${files.file.originalFilename}`;// 拼接图片名称：时间戳-图片名称
    fs.writeFileSync(`${res.path}/src/images/userPic/${fullFileName}`, fs.readFileSync(files.file.filepath)); // 存储图片到public静态资源文件夹下
    res.send({
      status: 1,
      message: '上传成功',
      queryData: `${res.website}/images/userPic/${fullFileName}`  // 图片网络地址
    })
  });
}

/**
 * @api {post} /api/uploadUserPic 上传用户头像
 * @apiName uploadUserPic
 * @apiGroup user
 * 
 * @apiParams {String} files 文件流
 * 
 * @apiSuccess {Number} status 请求状态 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
*/

// 修改用户头像
exports.updataUserPic = (req, res) => {
  const userInfo = req.body
  const sqlStr = 'UPDATE userInfo SET user_pic = ? WHERE userId = ?'
  db.query(sqlStr, [userInfo.userPic, parseInt(userInfo.userId)], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('修改头像失败')
    res.send({
      status: 1,
      message: '修改头像成功'
    })
  })
}

/**
 * @api {post} /api/updataUserPic 修改用户头像
 * @apiName updataUserPic
 * @apiGroup user
 * 
 * @apiParams {String} files 文件流
 * 
 * @apiSuccess {Number} status 请求状态 1 表示成功 0 表示失败
 * @apiSuccess {String} message 请求说明
*/

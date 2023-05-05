const db = require('../mysqlFrom/index')
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
        token: 'Bearer ' + tokenStr,
        userId: results[0].userId
      })
    } else {
      res.cc('密码错误')
    }
  })
}
/**
 * @api {post} /my/loginFunction 用户信息
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

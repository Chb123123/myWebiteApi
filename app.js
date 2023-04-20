const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
// 解析表单验证
const joi = require('joi')
// 解析token 字符
const config = require('./src/config.js')
const jwt = require('jsonwebtoken')
const expressJWT = require('express-jwt')

// 解决跨域问题
app.use(cors())
// 解析body和query内的数据
app.use(bodyParser.json({ extended: false }))
app.use(express.urlencoded({ extended: false }))

// 共享本地图片
app.use('/images', express.static('./src/images'))
// 中间件 封装 res.cc 用来快速发起请求, 默认请求失败
app.use((req, res, next) => {
  res.cc = function (err, status = 0) {
    res.send({
      status: status,
      message: err instanceof Error ? err.message : err
    })
  }
  next()
})
// 判断数据是否合理
app.use((req, res, next) => {
  res.estimate = function (obj, itemList) {
    for (let item of itemList) {
      if (!obj[item]) {
        res.send({
          status: 0,
          message: '缺少必要参数'
        })
      }
      if (obj[item] === '') {
        res.send({
          status: 0,
          message: '参数不能为空'
        })
      }
    }
  }
  next()
})

app.use((req, res, next) => {
  res.path = __dirname // 返回文件路径
  next()
})
app.use((req, res, next) => {
  res.website = 'http://127.0.0.1:80'
  next()
})
// 使用 .unless() 指定哪些接口不需要 就行token 验证
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/my\//] }))
// app.use((req, res, next) => {
//   expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/my\//] })
//   if (!req.headers.token) return res.cc('验证token失败')
//   // 验证token
//   const token = req.headers.token.split(' ')[1]
//   let payload = jwt.verify(token, config.jwtSecretKey)
//   if (!payload) return res.cc('验证token失败')
//   next()
//   // expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/my\//] })
// })
// 用户信息
const userInfo = require('./src/router/index')
// 网页信息
const homeInfo = require('./src/router/home')
// 登入信息
const loginInfo = require('./src/router/login.js')
app.use('/api', homeInfo, userInfo)
app.use('/my', loginInfo)


// 错误级别中间件
app.use((err, req, res, next) => {
  console.log(err)
  if (err instanceof joi.ValidationError) return res.cc(err, 0)
  if (err.name === 'UnauthorizedError') return res.cc('token认证失败', 2)
  if (err) return res.cc(err)
})


app.listen(80, function () {
  console.log('http://127.0.0.1:80')
})
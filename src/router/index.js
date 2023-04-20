const express = require('express')
const router = express.Router()
// const upload = require('../util/updateUserPic')

const { reg_userName_schema, updataPassword_schema } = require('../schema/user')
const expressJoi = require('@escook/express-joi')
const userRouter = require('../router-handler/index')

// 获取用户信息
router.get('/userInfo', userRouter.getUserInfo)
// 获取用户首页tab栏
router.get('/userIndex', userRouter.getUserIndex)
// 获取 tab栏相关的数据
router.get('/tableInfo', userRouter.getTableInfo)
// 修改用户名称
router.post('/updataUserName', expressJoi(reg_userName_schema), userRouter.updataUserName)
// 修改用户密码
router.post('/updataPassword', expressJoi(updataPassword_schema), userRouter.updataPassword)
// 修改用户签名
router.post('/updataSignature', userRouter.updataSignature)
// 上传用户头像
router.post('/uploadUserPic', userRouter.uploadUserPic)
// 修改用户头像
router.post('/updataUserPic', userRouter.updataUserPic)
module.exports = router
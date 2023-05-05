const express = require('express')
const router = express.Router()
// const upload = require('../util/updateUserPic')

const { reg_userName_schema, updataPassword_schema } = require('../schema/user')
const { req_releaseWorks_schema, req_getUserWorks_schema, req_removeWorks_schema } = require('../schema/works.js')
const expressJoi = require('@escook/express-joi')
const userRouter = require('../router-handler/user')

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
// 获取作品集
router.get('/getWordsList', userRouter.getWordsList)
// 获取用户发布的作品集
router.get('/getUserWorks', expressJoi(req_getUserWorks_schema), userRouter.getUserWorks)
// 发布作品集
router.post('/releaseWorks', expressJoi(req_releaseWorks_schema), userRouter.releaseWorks)
// 删除作品
router.delete('/removeWorks',expressJoi(req_removeWorks_schema), userRouter.removeWorks)
module.exports = router
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')
// 导入验证规则
const { reg_login_schema, reg_check_schema } = require('../schema/user')

const userRouter = require('../router-handler/login.js')

// 注册功能
router.post('/registerUser', expressJoi(reg_login_schema ), userRouter.registerUser)
// 判断账号是否存在
router.get('/userIsExist', expressJoi(reg_check_schema ), userRouter.userIsExist)
// 登入功能
router.post('/loginFunction', expressJoi(reg_login_schema ), userRouter.loginFunction)
module.exports = router
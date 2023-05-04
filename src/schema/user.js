const joi = require('joi')

// 用户名的验证规则
const accountNumber = joi.string().alphanum().min(6).max(12).required()
// 正则表达式规则 [S]表示空 {6-12} 表示6-12个字符之间 required() 表示不能为 undefined 
const password = joi.string().min(6).max(20).required()
exports.reg_login_schema = {
  // 表示在 req.body 内传递的数据进行验证
  body: {
    accountNumber,
    password
  },

  query: {

  }
}

exports.reg_check_schema = {
  query: {
    accountNumber
  }
}

// 用户昵称
const userName = joi.string().min(1).max(15).required()
exports.reg_userName_schema = {
  body: {
    userName
  }
}

// 更新用户密码
exports.updataPassword_schema = {
  body: {
    oldPassword: password,
    // 旧密码不能与新密码保持一致
    // joi.ref('oldPwd) 表示 newPwd的值 必须和 oldPwd 的值保持一致
    // joi.not(joi.ref('old')) 表示 newPwd 的值不能 和 newPwd 保持一致
    // .concat() 用于合并 joi.not(joi.ref('oldPwd)) 和 password 这两条验证规则
    newPassword: joi.not(joi.ref('oldPassword')).concat(password),
    userId: joi.string()
  }
}

// 用户id 验证规则 不能为空
const userId = joi.string().required()
exports.req_userId_schema = {
  query: {
    userId
  }
}
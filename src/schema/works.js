const joi = require('joi')

// 查询用户发布的作品
exports.req_getUserWorks_schema = {
  query: {
    userId: joi.string().required(),
    page: joi.string().required(),
    size: joi.string().required()
  }
}

// 新增用户作品规则
exports.req_releaseWorks_schema = {
  body: {
    userId: joi.string().required(),
    title: joi.string().required(),
    platform: joi.string().required(),
    wordsAddress: joi.string().required(),
    introduction: joi.string().required()
  }
}

// 删除作品
exports.req_removeWorks_schema = {
  body: {
    userId: joi.string().required(),
    id: joi.string().required()
  }
}
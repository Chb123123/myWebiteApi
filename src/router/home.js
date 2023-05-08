const express = require('express')
const router = express.Router()

const homeInfo = require('../router-handler/home')
// 数据检索
const expressJoi = require('@escook/express-joi')
const { req_releaseWorks_schema, req_getUserWorks_schema, req_removeWorks_schema } = require('../schema/works.js')

// 获取首页信息
router.get('/gethomeTable', homeInfo.getHomeTab)
// 焦点图列表
router.get('/getHomeFouseMap', homeInfo.getHomeFouseMap)
// 用户发布文章
router.post('/releaseArticle', homeInfo.releaseArticle)
// 用户修改文章
router.post('/updataArticle', homeInfo.updataArticle)
// 获取用户文章
router.get('/getArticleList', homeInfo.getArticleList)
// 用户删除文章
router.delete('/reomveArticle', homeInfo.reomveArticle)
// 上传文章图片
router.post('/uploadImg', homeInfo.uploadImg)

// 获取作品集
router.get('/getWordsList', homeInfo.getWordsList)
// 获取用户发布的作品集
router.get('/getUserWorks', expressJoi(req_getUserWorks_schema), homeInfo.getUserWorks)
// 发布作品集
router.post('/releaseWorks', expressJoi(req_releaseWorks_schema), homeInfo.releaseWorks)
// 删除作品
router.delete('/removeWorks',expressJoi(req_removeWorks_schema), homeInfo.removeWorks)
module.exports = router

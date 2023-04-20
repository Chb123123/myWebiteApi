const express = require('express')
const router = express.Router()

const homeInfo = require('../router-handler/home')

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
// 获取页面图片列表
router.get('/getViewImage', homeInfo.getViewImage)
module.exports = router

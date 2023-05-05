const express = require('express')
const router = express.Router()

const imagesInfo = require('../router-handler/images.js')

// 获取页面图片列表
router.get('/getViewImage', imagesInfo.getViewImage)

module.exports = router
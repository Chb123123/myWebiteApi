const express = require('express')
const router = express.Router()

const upload = require('../router-handler/uploadFile.js')

// 上传图片功能
router.post('/upload/img', upload.uploadImg)
// 后台上传图片功能
router.post('/upload/system/img', upload.uploadImg)
// 上传文件功能
router.post('/upload/file', upload.uploadFile)
module.exports = router
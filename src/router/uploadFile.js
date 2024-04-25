const express = require('express')
const router = express.Router()

const upload = require('../router-handler/uploadFile.js')

// 上传图片功能
router.post('/upload/img', upload.uploadImg)
module.exports = router
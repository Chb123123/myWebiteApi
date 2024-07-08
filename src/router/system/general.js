const express = require('express')
const router = express.Router()

const articleHandler = require('../../router-handler/system/article.js')


router.get('/article/page', articleHandler.getArticlePage)
module.exports = router
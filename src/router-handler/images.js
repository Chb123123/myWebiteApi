const db = require('../mysqlFrom/index')

// 获取页面图片列表
exports.getViewImage = (req, res) => {
  console.log(res.website)
  // let sqlStr = 'select * from viewImg limit ?, ?'
  let sqlStr = `select id, title, CONCAT_WS('', '${res.website}', url) url, type from viewImg limit ?, ?`
  let info = req.query
  if (!info.type) {
    let total = 0
    let getTypeCount = 'select count(*) as total from viewImg'
    db.query(getTypeCount, (err, results) => {
      if (err) return res.cc(err)
      if (results.length === 0) return res.cc('查询数据失败')
      total = results[0].total
      db.query(sqlStr, [(parseInt(info.page) * parseInt(info.size)), parseInt(info.size)], (err, results) => {
        if (err) return res.cc(err)
        if (results.length === 0) return res.cc('图片数据不存在')
        res.send({
          status: 1,
          message: '成功',
          queryData: {
            total: total,
            results: results
          }
        })
      })
    })
  } else {
    let total = 0
    let getTypeCount = 'select count(*) as total from viewImg where type = ?'
    db.query(getTypeCount, info.type, (err, results) => {
      if (err) return res.cc(err)
      if (results.length === 0) return res.cc('查询数据失败')
      total = results[0].total
      let sqlStr1 = `select id, title, CONCAT_WS('','${res.website}',url) url, type from viewImg where type = ? limit ?, ?`
      // let sqlStr1 = "select id, title, url, type from viewImg where type = ? limit ?, ?"
      db.query(sqlStr1, [info.type, (parseInt(info.page) * parseInt(info.size)), parseInt(info.size)], (err, results) => {
        if (err) return res.cc(err)
        if (results.length === 0) return res.cc('图片数据不存在')
        res.send({
          status: 1,
          message: '成功',
          queryData: {
            total: total,
            results: results
          }
        })
      })
    })
  }
}

/**
 * @api {get} /api/getViewImage 获取页面图片列表
 * @apiName getViewImage
 * @apiGroup Images
 * 
 * @apiParam {Number} page 页号
 * @apiParam {Number} size 数量
 * @apiParam {String} [type] 图片类型
 * 
 * @apiSuccess {Number} status 请求状态码
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 图片列表
 * @apiSuccess {Number} total 图片数量
*/
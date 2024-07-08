const db = require('../../mysqlFrom/index')

function getSqlPage(sql, res) {
  let newSql = sql
  let flag = !isNaN(parseFloat(res.size)) && isFinite(res.size)
  let flag1 = !isNaN(parseFloat(res.page)) && isFinite(res.page)
  if(flag && flag1) {
    const page = (parseFloat(res.page) - 1) * parseFloat(res.size)
    const size = parseFloat(res.size)
    newSql += ` LIMIT ${page}, ${size}`
  }
  return newSql
}

function getTotal(form) {
  return new Promise(resolve => {
    const sql = `select count(*) as num from ${form}`
    db.query(sql, (err, results) => {
      if(err) resolve(0);
      resolve(results[0].num)
    })
  })
}

exports.getArticlePage = (req, res) => {
  const sql = 'SELECT a.articleId, a.title, a.article, a.time, a.coverImg, a.userId, u.userName FROM userarticle AS a INNER JOIN userinfo AS u WHERE a.userId = u.userId'
  const newSql = getSqlPage(sql, req.query)
  db.query(newSql, async (err, results) => {
    if(err) return res.cc('获取数据失败');
    const queryData = {
      rows: results,
      total: await getTotal('userarticle')
    }
    res.send({
      status: 1,
      message: "成功",
      queryData: queryData
    })
  })
}


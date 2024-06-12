const db = require('../../mysqlFrom/index')


// 获取表格数量
function getTableTatol(sql) {
  return new Promise((resovle) => {
    db.query(sql, (err, results) => {
      if(err) resovle(null);
      resovle(results)
    })
  })
}

// 查询角色列表
function roleList() {
  return new Promise((resovle) => {
    let sql = 'SELECT id, name FROM tb_userLimits WHERE STATUS = 1'
    db.query(sql, (err, results) => {
      if(err) resovle(null);
      resovle(results)
    })
  })
}

function getRoleName(arr, id) {
  for(let i = 0; i < arr.length; i++) {
    if(arr[i].id === id) {
      return arr[i].name
    }
  }
}

// 获取用户列表分页
exports.getUserList = async (req, res) => {
  let data = req.query
  if(!data.page || !data.size) {
    data.page = 0,
    data.size = 20
  } else {
    data.page = (parseInt(data.page) - 1) * parseInt(data.size)
    data.size = parseInt(data.size)
  }
  let sql =`SELECT userId, userName, user_pic as userPic, user_signature as userSignature, accountNumber, user_rank as userRank, create_time as createTime FROM userInfo WHERE STATUS = 1 LIMIT ${data.page}, ${data.size}`
  if(data.name && data.name !== "") {
    sql =`SELECT userId, userName, user_pic as userPic, user_signature as userSignature, accountNumber, user_rank as userRank, create_time as createTime FROM userInfo WHERE STATUS = 1 and userName LIKE('%${data.name}%') LIMIT ${data.page}, ${data.size}`
  }
  db.query(sql, async (err, results) => {
    if (err) return res.cc("获取数据失败");
    if (!(results instanceof Array)) return res.cc('获取数据失败');
    let sql1 = ''
    let userLimits = await roleList()
    for(let i = 0; i < results.length; i++) {
      results[i]['userRankName'] = getRoleName(userLimits, results[i]['userRank'])
    }
    if(!data.name || data.name === "") {
      sql1 = `SELECT count(*) as total FROM userInfo`
    } else {
      sql1 = `SELECT COUNT(*) AS total FROM userInfo WHERE userName LIKE('%${data.name}%')`
    }
    const num = await getTableTatol(sql1)
    if(!num) return res.cc('获取表格数量失败')
    let data1 = {
      total: num[0].total,
      rows: results
    }
    return res.ss(data1)
  })
}

const db = require('../../mysqlFrom/index')


// 获取表格数量
function getTableTatol(sql) {
  return new Promise((resovle) => {
    db.query(sql, (err, results) => {
      if (err) resovle(null);
      resovle(results)
    })
  })
}

// 查询角色列表
function roleList() {
  return new Promise((resovle) => {
    let sql = 'SELECT id, name FROM tb_userLimits WHERE STATUS = 1'
    db.query(sql, (err, results) => {
      if (err) resovle(null);
      resovle(results)
    })
  })
}

function getRoleName(arr, id) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === id) {
      return arr[i].name
    }
  }
}

// 获取用户列表分页
exports.getUserList = async (req, res) => {
  let data = req.query
  if (!data.page || !data.size) {
    data.page = 0,
      data.size = 20
  } else {
    data.page = (parseInt(data.page) - 1) * parseInt(data.size)
    data.size = parseInt(data.size)
  }
  let sql = `SELECT userId, userName, user_pic as userPic, user_signature as userSignature, accountNumber, user_rank as userRank, create_time as createTime FROM userInfo WHERE STATUS = 1 LIMIT ${data.page}, ${data.size}`
  if (data.name && data.name !== "") {
    sql = `SELECT userId, userName, user_pic as userPic, user_signature as userSignature, accountNumber, user_rank as userRank, create_time as createTime FROM userInfo WHERE STATUS = 1 and accountNumber LIKE('%${data.name}%') LIMIT ${data.page}, ${data.size}`
  }
  db.query(sql, async (err, results) => {
    if (err) return res.cc("获取数据失败");
    if (!(results instanceof Array)) return res.cc('获取数据失败');
    let sql1 = ''
    let userLimits = await roleList()
    for (let i = 0; i < results.length; i++) {
      results[i]['userRankName'] = getRoleName(userLimits, results[i]['userRank'])
    }
    if (!data.name || data.name === "") {
      sql1 = `SELECT count(*) as total FROM userInfo`
    } else {
      sql1 = `SELECT COUNT(*) AS total FROM userInfo WHERE accountNumber LIKE('%${data.name}%')`
    }
    const num = await getTableTatol(sql1)
    if (!num) return res.cc('获取表格数量失败')
    let data1 = {
      total: num[0].total,
      rows: results
    }
    return res.ss(data1)
  })
}

/**
 * @api {get} /api/user/page 获取用户分页信息
 * @apiName getUserList
 * @apiGroup System
 * 
 * @apiParam [Number] page 页号
 * @apiParam [Number] size 条数
 * @apiParam [String] name 用户名
 * 
 * @apiSuccess {Number} status 请求状态 1 表示请求成功， 0 表示请求失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 用户详情
*/


// 删除用户
exports.delectUserInfo = async (req, res) => {
  let user1 = await getUserInfo(res.userId)
  if (user1) {
    if (user1.key === 'admin') {
      let data = req.body
      if (!data.id) return res.cc('id不存在')
      let sql = `SELECT count(*) as count FROM userInfo WHERE STATUS = 1 and userId = ?`
      db.query(sql, parseInt(data.id), async (err, results) => {
        if (err) return res.cc("获取数据失败");
        if (!(results instanceof Array)) return res.cc('获取数据失败');
        if (results[0].count !== 1) return res.cc('用户不存在');
        const sql1 = 'UPDATE userinfo SET STATUS = 0 WHERE userId = ?'
        db.query(sql1, parseInt(data.id), async (err1, results1) => {
          if (err1) return res.cc("删除用户失败");
          if (results1.affectedRows !== 1) return res.cc('删除用户失败');
          res.send({
            status: 1,
            message: "删除用户成功"
          });
        })
      })
    } else {
      return res.cc('当前用户非管理员')
    }
  } else {
    return res.cc('获取用户失败')
  }
}

// 获取用户信息
function getUserInfo(id) {
  return new Promise((resovle) => {
    let sql = `SELECT u.userId AS id ,u.userName,a.name,a.key, u.status  FROM userInfo AS u INNER JOIN tb_account_ronk AS a ON u.user_rank = a.id WHERE u.userId = ${parseInt(id)}`
    db.query(sql, (err, results) => {
      if (err) return resovle(null)
      if (results.length !== 0) {
        resovle(results[0])
      } else {
        resovle(null)
      }
    })
  })
}

// 修改用户信息
exports.editUserInfo = async (req, res) => {
  let user1 = await getUserInfo(res.userId)
  if (user1) {
    if (user1.key === 'admin') {
      let data = req.body
      if(!data.userId || data.userId === '') return res.cc('用户id不存在')
      let sql = `SELECT count(*) as count FROM userInfo WHERE STATUS = 1 and userId = ?`
      db.query(sql, parseInt(res.userId), async (err, results) => {
        if (err) return res.cc("获取数据失败");
        if (!(results instanceof Array)) return res.cc('获取数据失败');
        if (results[0].count !== 1) return res.cc('用户不存在');
        console.log(data);
        let sql1 = setSqlStr(data)
        console.log(sql1)
        db.query(sql1, async (err1, results1) => {
          if (err1) return res.cc("修改用户失败");
          if (results1.affectedRows !== 1) return res.cc('修改用户失败');
          res.send({
            status: 1,
            message: "修改用户成功"
          });
        })
      })
    } else {
      return res.cc('当前用户非管理员')
    }
  } else {
    return res.cc('获取用户失败')
  }
}

function setSqlStr(data) {
  let updataStr = ''
  if(data.userName) {
    updataStr += `userName = '${data.userName}'`
  }
  if(data.userPic) {
    updataStr += `,user_pic = '${data.userPic}'`
  }
  if(data.userSignature) {
    updataStr += `,user_signature = '${data.userSignature}'`
  }
  if(data.accountNumber) {
    updataStr += `,accountNumber = '${data.accountNumber}'`
  }
  if(data.userRank) {
    updataStr += ',user_rank = ' + data.userRank
  }
  let str = `UPDATE userinfo SET ${updataStr} WHERE userId = ${parseInt(data.userId)}`
  return str
}

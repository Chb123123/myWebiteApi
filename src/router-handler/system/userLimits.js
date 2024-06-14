const db = require('../../mysqlFrom/index')

exports.getUserLimit = (req, res) => {
  const sql = `SELECT u.userId as id,u.userName,a.name,a.key, u.status  FROM userInfo AS u INNER JOIN tb_account_ronk AS a ON u.user_rank = a.id WHERE u.userId = ${res.userId}`
  db.query(sql, async (err, results) => {
    if (err) return res.cc("获取数据失败");
    if (results.length === 0) return res.cc('用户不存在');
    let sql1 = `SELECT system_id as id FROM tb_permiss WHERE user_id = ${res.userId}`
    db.query(sql1, async (err, results1) => {
      if (err) return res.cc("获取数据失败");
      let data = results[0]
      data['permiss'] = [];
      if (results1 instanceof Array && results1.length > 0) {
        for (let i = 0; i < results1.length; i++) {
          data.permiss.push(results1[i].id)
        }
      }
      res.send({
        status: 1,
        message: "查询成功",
        queryData: data
      })
    })
  })
}

/**
 * @api {get} /api/getUserLimit 查询用户权限详情
 * @apiName getUserLimit
 * @apiGroup System
 * 
 * @apiSuccess {Number} status 请求状态 1 表示请求成功， 0 表示请求失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 用户详情
*/

// 修改用户权限
exports.editUserLimit = async (req, res) => {
  let user1 = await getUserInfo(res.userId)
  if (user1) {
    if (user1.key === 'admin') {
      // 查询全部数据
      let data = req.body
      let user = await getUserInfo(parseInt(data.userId))
      if (user) {
        if (user.key === 'admin') {
          // 查询全部数据
          return res.cc("管理员权限不允许修改")
        }
      } else {
        return res.cc('用户异常')
      }
      let sql1 = `SELECT system_id as id FROM tb_permiss WHERE user_id = ${parseInt(data.userId)}`
      db.query(sql1, async (err, results) => {
        if (err) return res.cc("获取数据失败");
        data['permiss'] = [];
        let list = []
        for (let i = 0; i < results.length; i++) {
          list.push(results[i].id)
        }
        let sqlList = []
        let differenceList = getArrDifference(data.list, list)
        for (let i = 0; i < differenceList.length; i++) {
          let sql = {
            sql: "insert into tb_permiss(user_id, system_id) values(?, ?)",
            values: [parseInt(data.userId), differenceList[i]]
          }
          sqlList.push(sql)
        }
        let addList = getArrDifference(list, data.list)
        for (let i = 0; i < addList.length; i++) {
          let sql = {
            sql: "DELETE FROM tb_permiss WHERE system_id = ? and user_id = ?",
            values: [addList[i], parseInt(data.userId)]
          }
          sqlList.push(sql)
        }
        execTransection(sqlList).then(resp => {
          res.send({
            status: 1,
            message: "修改成功",
          })
        }).catch(err => {
          res.cc("修改权限失败")
        })
      })
    } else {
      return res.cc('当前用户非管理员')
    }
  } else {
    return res.cc('获取用户失败')
  }
}
const execTransection = (sqlArr) => {
  return new Promise((resolve, reject) => {
    var promiseArr = [];
    db.getConnection(function (err, connection) {
      if (err) {
        return reject(err)
      }
      connection.beginTransaction(err => {
        if (err) {
          return reject('开启事务失败')
        }
        // 将所有需要执行的sql封装为数组
        promiseArr = sqlArr.map(({ sql, values }) => {
          return new Promise((resolve, reject) => {
            connection.query(sql, values, (e, rows, fields) => {
              if (e) {
                reject(e)
              } else if (rows.affectedRows === 0) {
                reject(e)
              } else {
                resolve({ rows, success: true })
              }
            })
          })
        })
        // Promise调用所有sql，一旦出错，回滚，否则，提交事务并释放链接
        Promise.all(promiseArr).then(res => {
          connection.commit((error) => {
            if (error) {
              reject(error)
            }
          })
          connection.release()  // 释放链接
          resolve(res)
        }).catch(err => {
          connection.rollback(() => {
            console.log('数据操作回滚')
          })
          reject(err)
        })
      })
    });
  })
}
function getArrDifference(arr1, arr2) {
  let arr = []
  for (let i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(arr1[i]) === -1) {
      arr.push(arr1[i])
    }
  }
  return arr
}

exports.getUserLimitId = async (req, res) => {
  if (req.query.id) {
    let user = await getUserInfo(parseInt(req.query.id))
    if (user) {
      const sql = `SELECT u.userId as id,u.userName,a.name,a.key, u.status  FROM userInfo AS u INNER JOIN tb_account_ronk AS a ON u.user_rank = a.id WHERE u.userId = ${parseInt(req.query.id)}`
      db.query(sql, async (err, results) => {
        if (err) return res.cc("获取数据失败");
        if (results.length === 0) return res.cc('用户不存在');
        let sql1 = `SELECT system_id as id FROM tb_permiss WHERE user_id = ${parseInt(req.query.id)}`
        db.query(sql1, async (err, results1) => {
          if (err) return res.cc("获取数据失败");
          let data = results[0]
          data['permiss'] = [];
          if (user.key === 'admin') {
            // 查询全部数据
            data.permiss = await getAllIdList()
          } else {
            if (results1 instanceof Array && results1.length > 0) {
              for (let i = 0; i < results1.length; i++) {
                data.permiss.push(results1[i].id)
              }
            }
          }
          res.send({
            status: 1,
            message: "查询成功",
            queryData: data
          })
        })
      })
    } else {
      return res.cc('用户异常')
    }
  } else {
    res.cc('id不能为空')
  }
}

function getAllIdList() {
  return new Promise((results1) => {
    const sql = 'SELECT id, title, path, parent_id as parentId, icon, z_index As zIndex FROM tb_tree where parent_id = 0'
    db.query(sql, async (err, results) => {
      if (err) results1(null);
      let data = JSON.parse(JSON.stringify(results))
      for (let i = 0; i < data.length; i++) {
        const node = await getTreeNode1(data[i].id)
        if (node) {
          data[i].children = node
          for (let j = 0; j < node.length; j++) {
            const node1 = await getTreeNode1(node[j].id)
            if (node1) {
              data[i].children[j].children = node1
            }
          }
        }
      }
      let arr = getIdList(data, [])
      results1(arr)
    })
  })

}

function getIdList(arr, idList) {
  if (arr instanceof Array) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].children) {
        getIdList(arr[i].children, idList)
      } else {
        idList.push(arr[i].id)
      }
    }
  }
  return idList
}
/**
 * @api {get} /api/getUserLimit 查询用户权限详情
 * @apiName getUserLimit
 * @apiGroup System
 * 
 * @apiSuccess {Number} status 请求状态 1 表示请求成功， 0 表示请求失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 用户详情
*/

exports.getUserLimitTree = async (req, res) => {
  let user = await getUserInfo(res.userId)
  if (user) {
    if (user.key === 'admin') {
      // 查询全部数据
      const sql = 'SELECT id, title, path, parent_id as parentId, icon, z_index As zIndex FROM tb_tree where parent_id = 0'
      db.query(sql, async (err, results) => {
        if (err) return res.cc("获取数据失败");
        let data = JSON.parse(JSON.stringify(results))
        for (let i = 0; i < data.length; i++) {
          const node = await getTreeNode1(data[i].id)
          if (node) {
            data[i].children = node
            for (let j = 0; j < node.length; j++) {
              const node1 = await getTreeNode1(node[j].id)
              if (node1) {
                data[i].children[j].children = node1
              }
            }
          }
        }
        res.send({
          status: 1,
          message: "查询成功",
          queryData: data
        })
        return
      })
    } else {
      let sql = `SELECT system_id as id FROM tb_permiss WHERE user_id = ${res.userId}`
      db.query(sql, async (err, results) => {
        if (err) return res.cc("获取数据失败");
        if (results.length === 0) return res.cc('用户不存在');
        let tree = []
        for (let i = 0; i < results.length; i++) {
          let node = await getTreeNode(results[i].id)
          if (node.parentId === 0) {
            tree.push(node)
          } else {
            let arr = [node]
            let node1 = node
            while (true) {
              node1 = await getTreeNode(node1.parentId)
              arr.unshift(node1)
              if (node1.parentId === 0) {
                break;
              }
            }
            let len = arr.length
            let supperNode = arr[0]
            switch (len) {
              case 2:
                supperNode.children = arr[1];
                break;
              case 3:
                supperNode.children = arr[1];
                supperNode.children.children = arr[2]
            }
            tree = setTree(tree, supperNode)
          }
        }
        res.send({
          status: 1,
          message: "查询成功",
          queryData: tree
        })
      })
    }
  } else {
    return res.cc('用户异常')
  }

}

function getTreeNode1(id) {
  return new Promise((resovle) => {
    const sql = `SELECT id, parent_id AS parentId, title, path, z_index As zIndex, icon FROM tb_tree where parent_id = ${id}`
    db.query(sql, (err, results) => {
      if (err) resovle(null)
      if (results.length !== 0) {
        resovle(results)
      } else {
        resovle(null)
      }
    })
  })
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

function setTree(list, node) {
  let listIndex = -1
  let flag = list.some((item, index) => {
    if (item.id === node.id) {
      listIndex = index
      return true
    }
  })
  if (flag) {
    if (list[listIndex].children) {
      if (!(list[listIndex].children instanceof Array)) {
        list[listIndex].children = [list[listIndex].children]
      }
      let childrenIndex = 0
      let flag1 = false
      for (let i = 0; i < list[listIndex].children.length; i++) {
        if (list[listIndex].children[i].id === node.children.id) {
          childrenIndex = i
          flag1 = true
          if (list[listIndex].children[i].children) {
            if (!(list[listIndex].children[i].children instanceof Array)) {
              list[listIndex].children[i].children = [list[listIndex].children[i].children]
            }
            list[listIndex].children[i].children.push(node.children.children)
          } else {
            list[listIndex].children[i].children = [node.children.children]
          }
        }
      }
      if (!flag1) {
        list[listIndex].children.push(node.children)
      }
    } else {
      list[listIndex].children = [node.children]
    }
  } else {
    list.push(node)
  }
  return list
}

function getTreeNode(id) {
  return new Promise((resovle) => {
    const sql = `SELECT id, parent_id AS parentId, title, path, z_index As zIndex, icon FROM tb_tree where id = ${id}`
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

/**
 * @api {get} /api/getUserLimitTree 查询用户权限节点
 * @apiName getUserLimit
 * @apiGroup System
 * 
 * @apiSuccess {Number} status 请求状态 1 表示请求成功， 0 表示请求失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 用户详情
*/

// 获取角色列表
exports.getRoleList = async (req, res) => {
  const sql = `SELECT id as value, name as label FROM tb_userlimits where status = 1`
  db.query(sql, async (err, results) => {
    if (err) return res.cc("获取数据失败");
    if (results.length === 0) return res.cc('用户不存在');
    res.send({
      status: 1,
      message: "查询成功",
      queryData: results
    })
  })
}
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

exports.getUserLimitTree = (req, res) => {
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

function setTree(list, node) {
  let listIndex = -1
  let flag = list.some((item, index) => {
    if(item.id === node.id) {
      listIndex = index
      return true
    }
  })
  if(flag) {
    if(list[listIndex].children) {
      if(!(list[listIndex].children instanceof Array)) {
        list[listIndex].children = [list[listIndex].children]
      }
      let childrenIndex = 0
      let flag1 = false
      for(let i = 0; i < list[listIndex].children.length; i++) {
        if(list[listIndex].children[i].id === node.children.id) {
          childrenIndex = i
          flag1 = true
          if(list[listIndex].children[i].children) {
            if(!(list[listIndex].children[i].children instanceof Array)) {
              list[listIndex].children[i].children = [list[listIndex].children[i].children]
            }
            list[listIndex].children[i].children.push(node.children.children)
          } else {
            list[listIndex].children[i].children = [node.children.children]
          }
        }
      }
      if(!flag1) {
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
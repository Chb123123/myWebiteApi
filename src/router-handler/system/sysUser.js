const db = require('../../mysqlFrom/index')
const formatTime = require('silly-datetime')
const fs = require("fs");


exports.getSystemTree = (req, res) => {
  const sql = 'SELECT id, title, path, parent_id as parentId, icon, z_index As zIndex FROM tb_tree where parent_id = 0'
  db.query(sql, async (err, results) => {
    if (err) return res.cc("获取数据失败");
    let data = JSON.parse(JSON.stringify(results))
    for (let i = 0; i < data.length; i++) {
      const node = await getTreeNode(data[i].id)
      if (node) {
        data[i].children = node
        for (let j = 0; j < node.length; j++) {
          const node1 = await getTreeNode(node[j].id)
          if (node1) {
            data[i].children[j].children = node1
          }
        }
      }
    }
    res.send({
      status: 1,
      queryData: data
    })
  })
}

function getTreeNode(id) {
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

/**
 * @api {get} /api/getSystemTree 获取系统树
 * @apiName getSystemTree
 * @apiGroup System
 * 
 * @apiSuccess {Number} status 请求状态 1 表示请求成功， 0 表示请求失败
 * @apiSuccess {String} message 请求说明
 * @apiSuccess {Array} queryData 请求数据
 * 
*/

exports.addTreeNode = (req, res) => {
  let body = req.body
  if (!body.parentId || body.parentId === "") {
    const sqlStr = "INSERT INTO tb_tree SET title = ?, parent_id = 0, path = ? ,icon = ?, z_index = 0"
    db.query(sqlStr, [body.title, body.path, body.icon], async (err, results) => {
      if (err) return res.cc("新增数据失败");
      let data = JSON.parse(JSON.stringify(results))
      res.send({
        status: 1,
        message: '新增节点成功'
      })
    })
  } else {
    const sql = 'SELECT id, title, path, icon, z_index As zIndex FROM tb_tree where id =' + parseInt(body.parentId)
    db.query(sql, async (err, results) => {
      if (err) return res.cc("获取数据失败");
      if (results.length === 0) {
        res.cc('父节点不存在')
        return
      }
      if (results[0].zIndex >= 2) return res.cc("节点层级不能大于3")
      const sqlStr = `INSERT INTO tb_tree SET title = ?, parent_id = ?, path = ? ,icon = ?, z_index = ${results[0].zIndex + 1}`
      db.query(sqlStr, [body.title, parseInt(body.parentId), body.path, body.icon], async (err, results) => {
        if (err) return res.cc("新增节点失败");
        if (results.affectedRows === 1) return res.cc('新增节点成功', 1)
        res.cc('新增节点失败')
      })
    })
  }
}

/**
 * @api {post} /api/addTreeNode 新增系统树节点
 * @apiName getSystemTree
 * @apiGroup System
 * 
 * @apiParams {String} title 节点名称
 * @apiParams {Number} parentId 节点父级，不填默认为父级
 * @apiParams {String} path 系统节点路径
 * @apiParams {String} icon 系统节点图标
 * 
 * @apiSuccess {Number} status 请求状态 1 表示请求成功， 0 表示请求失败
 * @apiSuccess {String} message 请求说明
 * 
*/

exports.editTreeNode = async (req, res) => {
  let body = req.body
  const sqlStr = `update tb_tree SET title = ?, path = ? ,icon = ? where id = ${parseInt(body.id)}`
  db.query(sqlStr, [body.title, body.path, body.icon], async (err, results) => {
    if (err) return res.cc("修改节点失败");
    if (results.affectedRows === 1) return res.cc('修改节点成功', 1)
    return res.cc('修改节点失败')
  })
}

/**
 * @api {post} /api/editTreeNode 修改系统树节点
 * @apiName editTreeNode
 * @apiGroup System
 * 
 * @apiParams {String} title 节点名称
 * @apiParams {String} path 系统节点路径
 * @apiParams {String} icon 系统节点图标
 * 
 * @apiSuccess {Number} status 请求状态 1 表示请求成功， 0 表示请求失败
 * @apiSuccess {String} message 请求说明
 * 
*/

exports.delectTreeNode = (req, res) => {
  let body = req.body
  const sql = 'SELECT id, title, path, icon, z_index As zIndex FROM tb_tree where parent_id =' + parseInt(body.id)
  db.query(sql, async (err, results) => {
    if (err) return res.cc("查询节点失败");
    if (results.length === 0) {
      const sqlStr = "DELETE FROM tb_tree WHERE id = " + body.id
      db.query(sqlStr, async (err, results) => {
        if (err) return res.cc("删除节点失败");
        if (results.affectedRows === 1) {
          res.send({
            status: 1,
            message: "删除节点成功"
          })
          return
        } else {
          return res.cc("删除节点失败");
        }
      })
    } else {
      return res.cc('节点存在下级，删除失败')
    }
  })
}

/**
 * @api {delete} /api/delectTreeNode 删除系统树节点
 * @apiName delectTreeNode
 * @apiGroup System
 * 
 * @apiParams {Number} id 树节点id
 * 
 * @apiSuccess {Number} status 请求状态 1 表示请求成功， 0 表示请求失败
 * @apiSuccess {String} message 请求说明
 * 
*/
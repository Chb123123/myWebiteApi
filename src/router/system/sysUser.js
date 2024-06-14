const express = require('express')
const router = express.Router()
const fs = require("fs");

const sysTem = require('../../router-handler/system/sysUser')
const userLimits = require('../../router-handler/system/userLimits')
const userHandler = require('../../router-handler/system/user')

// 获取系统树
router.get('/getSystemTree', sysTem.getSystemTree)
// 新增系统树
router.post('/addTreeNode', sysTem.addTreeNode)
// 修改系统树
router.post('/editTreeNode', sysTem.editTreeNode)
// 删除树节点
router.delete('/delectTreeNode', sysTem.delectTreeNode)
// 获取用户权限
router.get('/getUserLimit', userLimits.getUserLimit)
// 修改用户权限
router.post('/userLimit/edit', userLimits.editUserLimit)
// 根据用户id获取用户权限
router.get('/userLimit/get', userLimits.getUserLimitId)
// 获取用户节点数
router.get('/getUserLimitTree', userLimits.getUserLimitTree)
// 分页获取用户
router.get('/user/page', userHandler.getUserList)
// 删除用户
router.delete('/user/del', userHandler.delectUserInfo)
// 修改用户
router.post('/user/edit', userHandler.editUserInfo)
// 获取角色列表
router.get('/role/list', userLimits.getRoleList)
module.exports = router
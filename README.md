# uni

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

***
<br/>


# C端功能
## 主页
### 群主信息（静态
### 接龙列表
**点击进入接龙详情页**
#### 接龙信息
- 图片
- 名称
- 发布时间
- 状态
- 商品价格范围
- 已下单列表（序号、昵称、时间、购买的商品）  

***


## 接龙详情页
### 群主信息（静态
### 接龙信息
- 图片
- 名称
- 发布时间
- 结束时间
- 介绍文案

### 商品列表
**允许设置3个置顶商品**
#### 商品卡片
**点击展开商品详情弹窗**
- 图片
- 名称
- 价格
- 本次接龙中已购买数量
- **加车按钮**
  - 点击+1直接添加到购物袋
  - 可选数量

#### 商品详情弹窗
- 图片
- 名称
- 价格
- 介绍文案
- 数量选择按钮
- **底部加车按钮**

### 已下单列表
20条
- 序号
- 下单时间
- 下单商品 * 数量
- **点击分页**（可以不做

### 吸底区域
- **购物袋**
  - 数量badge
  - 总金额
- **下单按钮**
  - 点击进入下单页

***

## 下单页

### 提货点选择select

### 电话号码input

### 用户昵称获取

### 购物袋信息
- 商品图片
- 商品名称
- 单价
- 数量
- 总价

### 备注input

### 确认下单按钮
点击确认下单  
- 订单表写入
- 订单关联表写入
- 商品表库存扣减


***

## 个人页面
### 本人信息
- 昵称
- 头像

### 参与的接龙列表
#### 接龙信息
- 接龙号
- 下单时间
- 商品图片
- 商品名称
- 单价
- 数量
- 总价
- 自提点名称/地址
- 电话
- 备注
- 订单号
- **未截至时取消订单**
  - 订单表改变状态
  - 商品库存加回来


# CMS功能
## 管理自提点
- 若被接龙引用过则不准删除

## 管理商品
- 若被接龙引用过则不准删除
- 设置置顶

## 发布新接龙

## 管理接龙
status: 未开始 进行中 已结束 已取消

## 查看订单
- 导出为csv

# 后端难点（待补充
- 根据接龙配置自动更改状态


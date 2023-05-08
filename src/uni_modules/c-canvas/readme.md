# c-canvas

### 
- c-design 海报绘制组件

### c-design交流群号：330647926

### 示例预览
[https://cloud.vuedata.wang/cdesign/#/pages/canvas/canvas](https://cloud.vuedata.wang/cdesign/#/pages/canvas/canvas)

### 一、使用示例
```html
<template>
	<view>
		<c-canvas ref="cCanvas" @drawSuccess='thumb=$event' :drawData='drawData' :width='375' :height='475'></c-canvas>
		<image :src="thumb" mode="widthFix" style="width: 100%;"></image>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				thumb:'',
				canvasId:'myCanvas',
				width:375,height:475,
				drawData:[{
					type: 'image',
					x: 0,
					y: 0,
					value: 'https://mp-eeab6da6-80cd-4e80-844a-66b2a7203834.cdn.bspapp.com/cloudstorage/f5c141ce-472b-4ce7-8886-2028ca631e0c.png',
					width:375,height:475
				},{
					type: 'image',
					x: 0,
					y: 0,
					value: 'https://mp-eeab6da6-80cd-4e80-844a-66b2a7203834.cdn.bspapp.com/cloudstorage/f6bd3c29-d452-423e-a4a6-1728b9c2b074.jpeg',
					width:375,height:375,
					radius:10
				},
				{
					type: 'text',
					x: 10,
					y: 400,
					value: '22新款M2Apple/苹果 MacBook Air 13 英寸 MacBook Air笔记本电脑',
					color: '#262626',
					font:'normal 400 14px sans-serif',
					lineHeight:20,
					lineMaxWidth:250,
					lineNum:2
				},
				{
					type: 'image',
					x: 280,
					y: 385,
					value: 'https://mp-eeab6da6-80cd-4e80-844a-66b2a7203834.cdn.bspapp.com/cloudstorage/7dca3f02-baef-470d-88d2-eebd7c31ab73.jpg',
					width:80,height:80
				},
				{
					type: 'text',
					x: 10,
					y: 450,
					value: '¥ 9999.00',
					color: '#f44',
					font:'normal 400 24px sans-serif',
					lineHeight:20,
					lineMaxWidth:200,
					lineNum:2
				},]
			};
		},
		onReady() {
		}
	}
</script>


<style lang="scss"></style>
```



### 二、属性介绍

| 字段			| 类型		| 必填	| 默认值				| 描述								|
| -----------	| --------	| ----	| ----------------------| -------------------------------	|
| canvasId		| String	| 否	|  myCanvas				| 画布id							|
| isAuto		| Boolean	| 否	|  true					| 是否自动绘制						|
| width			| Number	| 否	|  375					| 画布宽度							|
| height		| Number	| 否	|  375					| 画布高度							|
| drawData		| Array		| 是	|  []					| 绘制数据 见下方描述				|

#### drawData 字段描述
| 字段			| 描述														|
| -------		| ---------------------------------							|
| type			| image 图片 text 文本										|
| x				| 元素在画布x轴上的位置 原点为画布左上角					|
| y				| 元素在画布y轴上的位置 原点为画布左上角					|
| value			| 需要绘制的内容 type=image 为图片地址 type=text 为文本		|
| width			| 图片宽度 type=image 有效								|
| height		| 图片高度 type=image 有效									|
| radius		| 图片圆角 type=image 有效									|
| color			| 文字颜色 type=text 有效									|
| font			| 文字样式 示例：'normal 400 14px sans-serif' type=text 有效|
| lineHeight	| 文字行高 type=text 有效									|
| lineMaxWidth	| 文字最大可绘制宽度 type=text 有效							|
| lineNum		| 文字行数 超出显示省略号 type=text 有效					|
| textAlign		| 文字对齐方式 可选值 left center right					|


### 三、Event

| 字段			| 描述											|
| ---------		| ------------------------						|
| drawSuccess	| 海报绘制成功事件 返回导出的图片路径			|

### 四、Methods

| 字段			| 描述											|
| ---------		| ------------------------						|
| draw			| isAuto=false时通过ref调用draw()方法可手动绘制	|

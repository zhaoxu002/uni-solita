<template>
  <view>
    <canvas
      type="2d"
      :canvas-id="canvasId"
      :id="canvasId"
      :style="{ width: `${width}px`, height: `${height}px` }"
      class="cCanvas"
    ></canvas>
  </view>
</template>

<script>
/**
	 * c-canvas 绘制海报组件
	 * @property {String} canvasId 画布id
	 * @property {Boolean} isAuto 是否自动绘制
	 * @property {Number} width 画布宽度
	 * @property {Number} height 画布高度
	 * @property {Array} drawData 绘制的数据  [{type: 'image',x: 0,y: 0,value: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-3e51af12-a055-4f58-b1ad-7710dd05bfc4/17d972b6-6c4e-4cab-a8c0-e9ee832ecc63.jpg',width:375,height:375},
		{type: 'text',x: 10,y: 20,value: '这是一段文字',color: '#F1D7A4',textAlign: 'center',font:'normal 400 12px sans-serif',lineHeight:20,lineMaxWidth:200,lineNum:1},]
	 * @event {Function()} drawSuccess 绘制成功 返回导出的图片路径
	 * */
let ctx = null,
  thumb = null;

const aspectFill = (imageWidth, imageHeight, canvasWidth, canvasHeight) => {
  const imageRate = imageWidth / imageHeight;
  const canvasRate = canvasWidth / canvasHeight;
  let [sx, sy, sw, sh] = [];
  if (imageRate >= canvasRate) {
    sw = imageHeight * canvasRate;
    sh = imageHeight;
    sx = (imageWidth - sw) / 2;
    sy = 0;
  } else {
    sh = imageWidth / canvasRate;
    sw = imageWidth;
    sx = 0;
    sy = (imageHeight - sh) / 2;
  }
  return [sx, sy, sw, sh];
};

export default {
  name: "c-canvas",
  props: {
    canvasId: {
      type: String,
      default: "myCanvas",
    },
    isAuto: {
      type: Boolean,
      default: true,
    },
    //画布宽度
    width: {
      type: Number,
      default: 375,
    },
    //画布高度
    height: {
      type: Number,
      default: 375,
    },
    drawData: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  emits: ["drawSuccess"],
  data() {
    return {};
  },
  methods: {
    drawText(item) {
      if (item.font) ctx.font = item.font;
      // #ifdef MP
      if (item.color) ctx.fillStyle = item.color;
      if (item.textAlign && item.x && item.y) ctx.textAlign = item.textAlign;
      // #endif
      // #ifndef MP
      if (item.color) ctx.setFillStyle(item.color);
      if (item.textAlign && item.x && item.y) ctx.setTextAlign(item.textAlign);
      // #endif
      // if(item.value)ctx.fillText(item.value,item.x||0,item.y||0)
      if (item.value)
        this.textPrewrap(
          ctx,
          item.value,
          item.x || 0,
          item.y || 0,
          item.lineHeight || 20,
          item.lineMaxWidth || 200,
          item.lineNum || 1
        );
    },
    async drawImage(item) {
      let Img = item.value;
      // #ifdef H5
      // if(this.checkUrl(Img)){
      // 	let res = await uni.downloadFile({url:item.value})
      // 	Img = res.tempFilePath
      // }
      // #endif
      if (item.radius) {
        await this.drawRoundRect(
          item.radius,
          item.x || 0,
          item.y || 0,
          item.width,
          item.height,
          Img
        );
      } else {
        // #ifdef MP
        let imgBit = await this.loadImg(Img);

        const [sx, sy, sw, sh] = aspectFill(
          imgBit.naturalWidth,
          imgBit.naturalHeight,
          item.width,
          item.height
        );

        ctx.drawImage(
          imgBit,
          sx, sy, sw, sh,
          item.x || 0,
          item.y || 0,
          item.width,
          item.height
        );
        // #endif
        // #ifndef MP
        ctx.drawImage(Img, item.x || 0, item.y || 0, item.width, item.height);
        // resolve()
        // #endif
      }
    },
    // #ifdef MP
    loadImg(src) {
      return new Promise((resolve, reject) => {
        let imgBit = this.canvas.createImage();
        imgBit.src = src;
        imgBit.onload = (e) => {
          resolve(imgBit);
        };
      });
    },
    // #endif
    /*
     *  参数说明
     *  ctx Canvas实例
     *  img 图片地址
     *   x  x轴坐标
     *   y  y轴坐标
     *   w  宽度
     *   h  高度
     *   r  弧度大小
     */
    async drawRoundRect(r, x, y, w, h, img) {
      ctx.save();
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.clip();
      // #ifdef MP
      let imgBit = await this.loadImg(img);
      ctx.drawImage(imgBit, x, y, w, h);
      // #endif
      // #ifndef MP
      ctx.drawImage(img, x, y, w, h);
      // #endif

      ctx.restore(); // 返回上一状态
    },
    getContext() {
      return new Promise((resolve) => {
        const { pixelRatio } = uni.getSystemInfoSync();
        uni
          .createSelectorQuery()
          .in(this)
          .select(`#${this.canvasId}`)
          .fields({ node: true, size: true })
          .exec((res) => {
            const { width, height } = res[0];
            const canvas = res[0].node;
            canvas.width = res[0].width * pixelRatio;
            canvas.height = res[0].height * pixelRatio;
            resolve({ canvas, width, height, pixelRatio });
          });
      });
    },
    async draw() {
      if (thumb) {
        this.$emit("drawSuccess", thumb);
        return;
      }
      // #ifdef MP
      const { canvas, pixelRatio } = await this.getContext();
      this.canvas = canvas;
      ctx = canvas.getContext("2d");
      ctx.scale(pixelRatio, pixelRatio);
      // #endif
      // #ifndef MP
      ctx = uni.createCanvasContext(this.canvasId, this);
      // #endif
      for (let item of this.drawData) {
        if (item.type == "text") {
          this.drawText(item);
        } else if (item.type == "image") {
          await this.drawImage(item);
        }
      }
      // #ifdef MP
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvas: this.canvas,
          quality: 1,
          success: (ret) => {
            // 在H5平台下，tempFilePath 为 base64
            thumb = ret.tempFilePath;
            this.$emit("drawSuccess", thumb);
          },
          fail: (err) => {
            console.log(err);
          },
        });
      }, 80);
      // #endif
      // #ifndef MP
      ctx.draw(false, () => {
        // console.log('绘制完成');
        // setTimeout(()=>{
        uni.canvasToTempFilePath({
          canvasId: this.canvasId,
          quality: 1,
          success: (ret) => {
            // 在H5平台下，tempFilePath 为 base64
            thumb = ret.tempFilePath;
            this.$emit("drawSuccess", thumb);
          },
          fail: (err) => {
            console.log(err);
          },
        });
        // },80)
      });
      // #endif
    },
    checkUrl(url) {
      return /(http|https):\/\/([\w.]+\/?)\S*/.test(url);
    },
    textPrewrap(ctx, content, drawX, drawY, lineHeight, lineMaxWidth, lineNum) {
      let drawTxt = ""; // 当前绘制的内容
      let drawLine = 1; // 第几行开始绘制
      let drawIndex = 0; // 当前绘制内容的索引

      // 判断内容是否可以一行绘制完毕
      if (ctx.measureText(content).width <= lineMaxWidth) {
        ctx.fillText(content, drawX, drawY);
      } else {
        for (let i = 0; i <= content.length; i++) {
          drawTxt += content[i];
          if (drawLine === lineNum && i == content.length) {
            if (ctx.measureText(drawTxt).width > lineMaxWidth) {
              // 最后一行添加省略号
              ctx.fillText(
                content.substring(drawIndex, i) + "...",
                drawX,
                drawY
              );
            } else {
              ctx.fillText(content.substring(drawIndex, i), drawX, drawY);
            }
          } else {
            if (ctx.measureText(drawTxt).width > lineMaxWidth) {
              // 不是最后一行的情况
              ctx.fillText(content.substring(drawIndex, i + 1), drawX, drawY);
              drawIndex = i + 1; // 记录当前行最后一个字符串的下一个idnex，用于绘制下行第一个字
              drawLine += 1; // 行数+1
              drawY += lineHeight; // 绘制内容的y坐标对应增加行高
              drawTxt = ""; // 重置绘制的内容
            }
          }
        }
      }
    },
  },
  mounted() {
    if (this.isAuto) this.draw();
  },
};
</script>

<style lang="scss">
.cCanvas {
  position: fixed;
  top: -10000px;
}
</style>

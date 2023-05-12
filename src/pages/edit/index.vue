<template>
  <div class="container">
    复制成功，请编辑新接龙的标题、开始时间、结束时间。其他选项编辑请到后台。
    <div>
      <uni-forms :model="formData" ref="form">
        <uni-forms-item label="标题" name="title" required>
          <uni-easyinput v-model="formData.title"> </uni-easyinput>
        </uni-forms-item>

        <uni-forms-item label="开始时间" name="startTime" required>
          <uni-datetime-picker
            v-model="formData.startTime"
            type="datetime"
            returnType="timestamp"
          >
          </uni-datetime-picker>
        </uni-forms-item>

        <uni-forms-item label="结束时间" name="endTime" required>
          <uni-datetime-picker
            v-model="formData.endTime"
            type="datetime"
            returnType="timestamp"
          >
          </uni-datetime-picker>
        </uni-forms-item>
      </uni-forms>
    </div>
    <div>
      <button @click="handleSavePublish">保存并发布</button>
      <button @click="handleSaveHide">保存并隐藏</button>
    </div>
  </div>
</template>

<script>
import uniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import uniDatetimePicker from "@/uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue";

export default {
  components: { uniForms, UniFormsItem, UniEasyinput, uniDatetimePicker },
  data() {
    return {
      id: "",
      formData: {
        startTime: 0,
        endTime: 0,
        title: "",
      },
      loading: false,
      required: [{ required: true }],
    };
  },

  onLoad(options) {
    const { id } = options;

    this.fetch(id);
  },

  methods: {
    fetch(id) {
      wx.cloud
        .callFunction({
          name: "purchase",
          data: {
            method: "getOne",
            _id: id,
          },
        })
        .then((res) => {
          this.process(res);
        });
    },

    process(res) {
      const {
        title,
        startTime,
        endTime,
        // isDelete
        _id,
      } = res.result.data;

      this.id = _id;
      this.formData = {
        startTime,
        endTime,
        title,
      };
    },

    submit(isDelete) {
      this.$refs.form.validate().then((data) => {
        const payload = {
          ...data,
          isDelete,
        };
        console.log(payload);

        wx.cloud
          .callFunction({
            name: "purchase",
            data: {
              method: "updateOne",
              _id: this.id,
              data: payload,
            },
          })
          .then((res) => {
            console.log(res);
            if (res.result.success) {
              uni.switchTab({
                url: "/pages/index/index",
              });
            }
          });
      });
    },

    handleSavePublish() {
      this.submit(false);
    },

    handleSaveHide() {
      this.submit(true);
    },
  },
};
</script>

<style scoped>
.container {
  padding: 16px;
}
</style>

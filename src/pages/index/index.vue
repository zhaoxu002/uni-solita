<template>
            <view>
                <view v-for="(item, index) in activities" :key="index">
                    {{ item.title }}

                    <button @tap="handleCheckDetail(item._id)">点击查看</button>
                </view>
            </view>
</template>

<script>
  import Vue from 'vue';

	export default Vue.extend({
		data() {
			return {
				title: 'Hello',
				activities: []

			}
		},
		onLoad() {
			this.handleGetActivities();

		},
		methods: {
			handleGetActivities() {
            wx.cloud
                .callFunction({
                    name: 'getActivities'
                })
                .then((res) => {
                    console.log(res);
                    // this.setData({
                    //     activities: res.result.data
                    // });
										this.activities = res.result.data
                });
        },

        handleCheckDetail(id) {
            // console.log(e.target.id);
            // wx.cloud
            //     .callFunction({
            //         name: 'getActivityDetail',
            //         data: {
            //             id: id
            //         }
            //     })
            //     .then((res) => {
            //         console.log(res.result.data);
            //     });
						wx.navigateTo({
							url: '/pages/activity/index?id=' + id

						})
        }
		}
	});
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin: 200rpx auto 50rpx auto;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>

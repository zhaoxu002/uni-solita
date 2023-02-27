<template>
    <view style="height: 100%">
        <!-- pages/test/index.wxml -->
        <view>
            <text>pages/test/index.wxml</text>
            <button @tap="handleOpen">open</button>

            <view>
                <view v-for="(item, index) in activities" :key="index">
                    {{ item.title }}

                    <button :id="item._id" @tap="handleCheckDetail">点击查看</button>
                </view>
            </view>
        </view>
        <page-container :show="popupShow" round>
            <text>sb</text>
        </page-container>
    </view>
</template>

<script>
// pages/test/index.js
export default {
    data() {
        return {
            popupShow: false,
            activities: []
        };
    }
    /**
     * 生命周期函数--监听页面加载
     */,
    onLoad(options) {},
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        wx.cloud
            .callFunction({
                name: 'getPickupLocations'
            })
            .then((res) => {
                console.log(res);
            });
        this.handleGetActivities();
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {},
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {},
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {},
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {},
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {},
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {},
    methods: {
        handleOpen() {
            this.setData({
                popupShow: true
            });
        },

        handleGetActivities() {
            wx.cloud
                .callFunction({
                    name: 'getActivities'
                })
                .then((res) => {
                    console.log(res);
                    this.setData({
                        activities: res.result.data
                    });
                });
        },

        handleCheckDetail(e) {
            console.log(e.target.id);
            wx.cloud
                .callFunction({
                    name: 'getActivityDetail',
                    data: {
                        id: e.target.id
                    }
                })
                .then((res) => {
                    console.log(res.result.data);
                });
        }
    }
};
</script>
<style>
/* pages/test/index.wxss */
</style>

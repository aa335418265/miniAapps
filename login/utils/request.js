var MD5 = require('../lib/md5.js');
const des = require('./des.js')
const userManager = require('./userManager.js');
const systemInfo = require('./systemInfo.js');


import { LoginStatusNormal, LoginStatusUnLogin, LoginStatusTokenInvalid } from './userManager.js'





var request = {

  requestConfig :{
    appType: 'moonAngel',
    loginSecretKey: '19491001',
    signSecretKey: 'Er78s1hcT4Tyoaj2',
    deviceNum: 'test999999999',
    cuid: 'test999999999',
    client:'ios',
  },

  //获取公共查询字符串
  getPublicQueryString: function () {

    var normal = {
      lng: 0,
      lat: 0,
      hig: 0,
      appType: this.requestConfig.appType,
      sysversion: systemInfo.systemInfo.version,
    };

    var params = {
      client: this.requestConfig.client,
      cuid: this.requestConfig.cuid,
      format: 'json',
      time: Date.parse(new Date()),
      version: systemInfo.systemInfo.version,
    };
    var signMd5 = this.getParamsMD5(params)
    params['sign'] = signMd5;

    //合并两个字典
    for (var key in normal) {
      params[key] = normal[key]
    }

    //获取所有key
    var keys = this.allKeys(params);
    //拼装url参数
    var str = ''
    for (var i in keys.sort()) {
      str += `${keys[i]}=${params[keys[i]]}&`
    }
    str = str.substring(0, str.length - 1)  //删除最后一个字符"&"

    return str;
  },

  getParamsMD5: function (params) {
    //获取所有key
    var keys = this.allKeys(params);

    //字符串拼接
    var str = '';
    str += this.requestConfig.signSecretKey //前后都要拼接秘钥
    for (var i in keys.sort()) {
      str += params[keys[i]]
    }
    str += this.requestConfig.signSecretKey //前后都要拼接秘钥

    //进行md5
    var md5Str = MD5.hexMD5(str); //进行md5
    return md5Str;
  },

  allKeys: function (dict) {
    var keys = [];
    for (var p in dict) {
      if (dict.hasOwnProperty(p))
        keys.push(p)
    }
    return keys
  },


  //登录
  login: function ({user, pwd, success, fail}) {
    var encryptString = des(pwd, this.requestConfig.loginSecretKey);//vuOShIfoI8SuPqjTlU+csw==
    console.log(encryptString)

    var url = 'https://angel.bluemoon.com.cn/bluemoon-control/user/ssoLogin'
    var queryString = this.getPublicQueryString();
    url = url + '?' + queryString
    wx.request({
      url: url,
      method: 'POST',
      data: {
        'account': user,
        'password': encryptString,
        'deviceNum': this.requestConfig.deviceNum,
      },
      success: function (res) {
        console.log(res)
        var responseCode = res.data.responseCode
        var responseMsg = res.data.responseMsg
        if (responseCode == 0) {
          //设置登录状态
          userManager.userInfo.token = res.data.token;
          userManager.userInfo.loginStatus = LoginStatusNormal;
          userManager.cacheUserInfo()

          //获取用户信息
          this.getUserInfo({token: token})
        }
        if(success){
          success(res)
        }

      },
      fail: function (res) {
        if(fail){fail(res)}
      },

    })
  },



  getUserInfo:function({token, success, fail}){
    var url = 'https://angel.bluemoon.com.cn/bluemoon-control/user/getUserInfo'
    var queryString = this.getPublicQueryString();
    url = url + '?' + queryString
    wx.request({
      url: url,
      method: 'POST',
      data:{
        token:token,
      },
      success:function(res){
        var responseCode = res.data.responseCode
        var responseMsg = res.data.responseMsg
        if (responseCode == 0) {
            userManager.userInfo.account = res.data.user.account
            userManager.userInfo.blood = res.data.user.blood
            userManager.userInfo.empType = res.data.user.empType
            userManager.userInfo.mobileNo = res.data.user.mobileNo
            userManager.userInfo.realName = res.data.user.realName
            userManager.userInfo.sex = res.data.user.sex
            userManager.cacheUserInfo()
        }
        if(success){success(res)}
      },
      fail:function(res){
        if (fail) { fail(res) }
      },
    })
  },
}

module.exports = request;
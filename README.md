# interactive-api-public
## 年会抽奖小程序后台
需要发布到小程序的云托管上
### 设定文件 config.js（需要按照小程序的环境ID和开发者ID调整）
```
const env = 'interactive-XXXXX' //小程序云的环境ID
const secretId = ''				//AppID(小程序ID)
const secretKey = ''			//AppSecret(小程序密钥)
```

### Dockerfile
可以在云托管中直接拉取镜像或上传代码发布容器，不需要另外部署服务器
使用云托管就不需要做网站备案，否则上线小程序的服务器必须使用通过备案的域名并使用HTTPS协议

### 相关数据集合结构
本程序所有的数据都采用小程序云的数据集合

#### BackupList
备份用记录集合

#### Message
当前状态
字段|定义
-|-
activity_id|000：投票 001：抽奖 002：小游戏 003：准备中
processing_number|当前轮次
prize|当前奖品名称
can_join|是否是可参加状态

```
{"_id":"ALL","activity_id":"003","processing_number":15,"prize":"返场小礼品","can_join":false}
{"_id":"OHS","member_count":118,"processing_count":8}
{"_id":"JHG","processing_count":8,"member_count":112}
```

#### Prize
奖品信息
```
{"_id":3,"prize_name":"Beats-Powerbeats Pro","prize_memo":""}
{"_id":5,"prize_name":"佳明-本能系列户外表","prize_memo":""}
{"_id":7,"prize_name":"哈曼卡顿-Allure","prize_memo":""}
{"_id":10,"prize_name":"黛珂-AQ护肤套装","prize_memo":""}
{"_id":14,"prize_name":"Apple-iPhone12 128G","prize_memo":""}
{"_id":4,"prize_name":"雅思兰黛-面部肌光精华","prize_memo":""}
{"_id":6,"prize_name":"乐高-机械组42110 路虎卫士","prize_memo":""}
{"_id":1,"prize_name":"大疆-OM4磁吸手机云台","prize_memo":""}
{"_id":2,"prize_name":"Kindle-PaperWhite","prize_memo":""}
{"_id":8,"prize_name":"大疆-Osmo Action","prize_memo":""}
{"_id":9,"prize_name":"戴森-吸尘器","prize_memo":""}
{"_id":13,"prize_name":"华为-P40 Pro 5G 8G+128G","prize_memo":""}
{"_id":12,"prize_name":"大疆-机甲大师","prize_memo":""}
{"_id":11,"prize_name":"Bosch-多功能破壁机","prize_memo":""}
{"_id":0,"prize_name":"演示用奖品","prize_memo":""}
{"_id":15,"prize_name":"返场小礼品","prize_memo":""}
```

#### ProcessingStaff
参加员工 程序运行中会根据条件自动添加

#### Staff
员工状态

字段|定义
-|-
_id|员工ID
avatar|微信头像
company|公司名(OHS;JHG)
prize_id|获得的奖品ID，未获奖
winning|是否已经获奖
open_id|微信用户的OpenID 判断登录用
prize_name|获得的奖品名称 默认为空
times|剩余抽奖次数

`{"_id":1234567,"avatar":"","company":"OHS","prize_id":0,"winning":false,"name":"XXX","open_id":"","prize_name":"","times":3}`


#### StaffInfo
员工信息（初期需要导入）

`{"_id":1234567,"company":"OHS","name":"XXX"}`

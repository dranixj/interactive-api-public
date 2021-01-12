const express = require('express')
const bodyParser = require('body-parser')
const util = require('./util')

const _ = util.db.command

const app = express()

app.use(bodyParser.json())


app.post('/logout/',async (req,res) =>{

  //获取用户的 openid
  const open_id = req.headers['x-wx-openid'] //用于云服务器
  //const open_id = req.body.open_id //用于本地测试

  let isErr = false
  //解绑其他绑定到该OpenID的账号
  await util.db.collection('Staff').where({open_id: open_id}).update(
      {open_id:''}
  ).catch(err=>{
    console.log('解绑OpenId失败')
    isErr = true
  })

  res.send(JSON.stringify({
    isErr: isErr
  }))
})

//参加活动
app.post('/join/',async (req,res) =>{

  //获取用户的 openid
  const open_id = req.headers['x-wx-openid'] //用于云服务器
  //const open_id = req.body.open_id //用于本地测试
  const processing_number = req.body.processing_number

  let isErr = false

  let staff = {}
  await util.db.collection('Staff').where({open_id: open_id}).get().then(result=>{
      if(result.data.length>0){
        staff = result.data[0]
      }
  }).catch(err=>{
    console.log(`参加活动获取用户失败` + open_id)
    isErr = true
  })
  if(staff._id == undefined){
    res.send(JSON.stringify({
      isErr: true
    }))
    return
  }

  let trans = null
  try{
    trans =await util.db.startTransaction()
    //判断剩余次数
    if(staff.times>0){
      await trans.collection('Staff').doc(staff._id).update(
        {times:_.inc(-1)}
      )
      await trans.collection('ProcessingStaff').add(
        {
          _id:staff.company + '_' + processing_number + '_' + staff._id,
          processing_number: processing_number,
          company: staff.company,
          staff_id: staff._id,
          avatar:  staff.avatar,
          name:  staff.name,
          shooting: false,
          winning: false,
        }
      )
    }
    await trans.commit()
  }
  catch(err){
    console.log(`transaction error`)
    res.send(JSON.stringify({
      isErr: true
    }))
    return
  }

  await util.db.collection('Message').doc(staff.company).update(
    {
      processing_count: _.inc(1)
    }
  ).catch(err=>{
    console.log('参加人数更新失败')
  })

  res.send(JSON.stringify({
    isErr: false
  }))

})

//API
app.post('/login/',async (req,res) =>{

    //社员编号
    let staff_id = req.body.staff_id
    //用户头像
    const avatar = req.body.avatar
    //获取用户的 openid
    const open_id = req.headers['x-wx-openid'] //用于云服务器
    //const open_id = req.body.open_id //用于本地测试

    let staff = await util.getStaff(staff_id,open_id)
    //登录（传递的员工编号不为空）
    if(staff_id!==''){
        //员工表里数据不存在（初次登录）
        if(staff._id == undefined){
            console.log(`员工号在Staff中不存在` + staff_id)
            let staffInfo = await util.getStaffInfo(staff_id)
            //用户信息存在
            if(staffInfo.staff_id!== undefined){
                //解绑其他绑定到该OpenID的账号
                await util.db.collection('Staff').where({open_id: open_id}).update(
                    {
                      open_id:'',
                      avatar: '',
                    }
                ).catch(err=>{
                  console.log('解绑OpenId失败')
                })

                //添加员工信息
                await util.db.collection('Staff').add(
                    {
                        _id: staffInfo.staff_id,
                        open_id: open_id,
                        name: staffInfo.name,
                        company: staffInfo.company,
                        avatar: avatar,
                        winning: false,
                        times: 3,
                        prize_id: 0,
                        prize_name: '',
                    }
                ).then(async resAdd=>{
                    staff = await util.getStaff(resAdd.id)
                }).catch(err=>{
                    console.log('添加员工信息失败')
                })
            }
            else{
                //用户信息不存在，返回错误信息
                res.send(JSON.stringify({
                    isErr: true
                }))
                return
            }
        }
        //已经登陆过
        else{
            if(open_id !== staff.open_id){
                //解绑其他绑定到该OpenID的账号
                await util.db.collection('Staff').where({open_id: open_id}).update(
                    { 
                      open_id:'',
                      avatar: '',
                    }
                ).catch(err=>{
                  console.log('解绑OpenId失败')
                })
                //绑定OpenID
                await util.db.collection('Staff').doc(staff._id).update(
                    {
                      open_id: open_id,
                      avatar: avatar,
                    }
                ).catch(err=>{
                  console.log('绑定OpenId失败')
                })
            }
        }
    }
    //再登陆（获取用户信息）
    else{
        if(staff._id==undefined){
            //用户信息不存在，返回错误信息
            res.send(JSON.stringify({
                isErr: true
            }))
            return
        }
    }

    let activity = {}
    //进行中的活动编号
    let processing_number = 0
    //是否可参加
    let can_join = false

    await util.db.collection('Message').doc('ALL').get().then(resMessage=>{
      if(resMessage.data.length>0){
        activity = {
          activity_id: resMessage.data[0].activity_id,
          activity_name: '',
          prize: resMessage.data[0].prize,
        }
        switch(resMessage.data[0].activity_id){
          case '000':
            activity.activity_name = '投票'
            break
          case '001':
            activity.activity_name = '抽奖'
            break
          case '002':
            activity.activity_name = '入围（小游戏）'
            break
          default:
            activity.activity_name = '等待中'
        }
        processing_number = resMessage.data[0].processing_number
        can_join = resMessage.data[0].can_join
      }
    }).catch(err=>{
      activity = {}
    })

    //是否入围(根据staff_id)
    let shooting = false

    await util.db.collection('ProcessingStaff').where(
      {
        staff_id: staff._id,
        processing_number: processing_number,
      }
    ).get().then(result=>{
      if(result.data.length>0){
        can_join = false
        shooting = result.data[0].shooting
      }
    }).catch(err=>{
      //console.log(err)
      can_join = false
      shooting = false
    })

    //活动参加活动总人数
    let processing_count = 0
    //参加人数
    let member_count = 120

    //console.log(`staff` + staff._id)
    await util.db.collection('Message').doc(staff.company).get().then(resMessage=>{
      if(resMessage.data.length>0){
        processing_count = resMessage.data[0].processing_count
        member_count = resMessage.data[0].member_count
      }
    }).catch(err=>{
      activity = {}
    })

    //奖品总数量
    let prize_count = 12
    
    res.send(JSON.stringify({
        staff: staff,
        activity: activity,
        processing_number: processing_number,
        processing_count: processing_count,
        prize_count: prize_count,
        member_count: member_count,
        shooting: shooting,
        can_join: can_join,
        isErr: false
    }))

})

const port = process.env.PORT || 80;
app.listen(port, () => {
    console.log('API listening on port', port)
})

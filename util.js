const tcp = require('@cloudbase/node-sdk')
const config = require('./config')
const cloud =tcp.init({
    env: config.env,
  })
const db = cloud.database()

//获取用户
//有staff_id(登录画面)根据staff_id，否则根据open_id
const getStaff  = async(staff_id, open_id) => {
    if(staff_id!==''){
        staff_id = Number(staff_id)
        return await db.collection('Staff').doc(staff_id).get().then(res => {       
            if(res.data.length>0){
                return res.data[0]
            }
            else{
                return {}

            }
        }).catch(err=>{
            return {}
        })
    }
    else{
        return await db.collection('Staff').where({open_id:open_id}).get().then(res => {       
            if(res.data.length>0){
                return res.data[0]
            }
            else{
                return {}
            }
        }).catch(err=>{
            return {}
        })
    }
}

const getStaffInfo = async(staff_id) =>{
    staff_id = Number(staff_id)
    return await db.collection('StaffInfo').doc(staff_id).get().then(resStaffInfo => {       
        if(resStaffInfo.data.length>0){
            return {
                staff_id: staff_id,
                name: resStaffInfo.data[0].name,
                company: resStaffInfo.data[0].company
              }
        }
        else{
            return {}
        }
    }).catch(err=>{
        return {}
    })
}

module.exports = {
    db:db,
    getStaff: getStaff,
    getStaffInfo: getStaffInfo,
}
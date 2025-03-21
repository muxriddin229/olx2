const axios = require("axios")
let api = axios.create({
    baseURL: "https://notify.eskiz.uz/api/",
    headers: {
        Authorization: `Bearer (token)`
    }
})


async function sendSMS(tel, otp){
    try {
        api.post("mesage/sms/send", {
            mobile_phone: tel,
            message: "Bu Eskiz dan test"
        })
        console.log("sended", otp, tel);
    } catch (error) {
        console.log(error);
        
    }
    
}

module.exports = sendSMS
 
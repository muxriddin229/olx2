const axios = require("axios");
let api = axios.create({
  baseURL: "https://notify.eskiz.uz/api/",
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDUxNDU0MzYsImlhdCI6MTc0MjU1MzQzNiwicm9sZSI6InRlc3QiLCJzaWduIjoiZTQyZGU0MGU2MmYyMDVjMDc3MmU4M2ZlMTBhZjFmMGZhOTQxOThjYWM0NDljYTdlMzg1ZDExYjYxODYxNzU2YSIsInN1YiI6Ijk3MzMifQ.k00sr2eUu2Ij14ea0Wy9nMnBgY63RZzbuCdLoZTNI5A`,
  },
});

async function sendSMS(tel, otp) {
  try {
    api.post("message/sms/send", {
      mobile_phone: tel,
      message: "Bu Eskiz dan test",
    });
    console.log("sended", otp, tel);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

module.exports = sendSMS;

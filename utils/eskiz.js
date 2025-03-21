require("dotenv").config();
const axios = require("axios");

let token = null;

// Eskizga login qilib token olish
const getToken = async () => {
  try {
    const response = await axios.post(
      "https://notify.eskiz.uz/api/auth/login",
      {
        email: process.env.ESKIZ_EMAIL,
        password: process.env.ESKIZ_PASSWORD,
      }
    );
    token = response.data.data.token;
  } catch (error) {
    console.error(
      "Eskiz login xatosi:",
      error.response ? error.response.data : error.message
    );
  }
};

// SMS yuborish funksiyasi
const sendSms = async (phone, message) => {
  if (!token) {
    await getToken();
  }

  try {
    const response = await axios.post(
      "https://notify.eskiz.uz/api/message/sms/send",
      {
        mobile_phone: phone,
        message: message,
        from: "4546", // Eskizdan tasdiqlangan sender ID
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("SMS yuborildi:", response.data);
  } catch (error) {
    console.error(
      "SMS yuborish xatosi:",
      error.response ? error.response.data : error.message
    );
    if (error.response && error.response.status === 401) {
      // Agar token eskirgan bo‘lsa, qayta login qilib urinamiz
      await getToken();
      return sendSms(phone, message);
    }
  }
};

module.exports = { sendSms };

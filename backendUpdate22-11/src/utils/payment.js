import crypto from "crypto";
import querystring from "qs";
import dateFormat from "dayjs";

const createVNPayPaymentUrl = async ({
  ipAddr,
  orderId,
  amount,
  orderInfo,
}) => {
  try {
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const secretKey = process.env.VNPAY_SECRET_KEY;
    let vnpUrl = process.env.VNPAY_VNP_URL;
    const returnUrl = process.env.VNPAY_RETURN_URL;

    const date = new Date();
    const createDate = dateFormat(date).format("YYYYMMDDHHmmss");
    const expiredDate = dateFormat(date).add(10, "m").format("YYYYMMDDHHmmss");

    const currCode = "VND";
    let vnp_Params = {};

    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderInfo;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100; // VNPAY yêu cầu số tiền nhân với 100
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    vnp_Params["vnp_ExpireDate"] = expiredDate;

    // Kiểm tra và xử lý các tham số trong vnp_Params
    for (let key in vnp_Params) {
      if (vnp_Params[key] === undefined || vnp_Params[key] === null) {
        throw new Error(`Tham số ${key} không hợp lệ`);
      }
      vnp_Params[key] = vnp_Params[key].toString(); // Đảm bảo tất cả các giá trị là chuỗi
    }

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    return vnpUrl;
  } catch (error) {
    console.log(error);
    throw new Error("Lỗi khi tạo URL thanh toán VNPay");
  }
};

const sortObject = (params) => {
  return Object.entries(params)
    .sort(([key1], [key2]) => key1.localeCompare(key2))
    .reduce((result, item) => {
      result[item[0]] = encodeURIComponent(item[1].replace(/ /g, "+"));
      return result;
    }, {});
};

export default createVNPayPaymentUrl;

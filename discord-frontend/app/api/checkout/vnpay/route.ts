import crypto from "crypto";
import { NextResponse } from "next/server";
import qs from "qs";

export async function POST(req: Request) {
  const { userId, plan } = await req.json();

  const vnp_TmnCode = process.env.VNP_TMNCODE!;
  const secretKey = process.env.VNP_HASH_SECRET!;
  const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify`;
  const amountVND = Math.round(plan.total * 27000); 

  const date = new Date();
  const pad = (n: number) => (n < 10 ? "0" + n : n);

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const createDate = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const orderId = date.getTime().toString();

  const vnp_Params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Payment for ${plan.name} by user ${userId}`,
    vnp_OrderType: "other",
  vnp_Amount: (amountVND * 100).toString(),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: "127.0.0.1",
    vnp_CreateDate: createDate,
  };

  // sort alphabetically
  const sortedKeys = Object.keys(vnp_Params).sort();
  const sortedParams: Record<string, string> = {};
  sortedKeys.forEach((key) => {
    sortedParams[key] = vnp_Params[key];
  });

  // sign
  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  sortedParams["vnp_SecureHashType"] = "SHA512";
  sortedParams["vnp_SecureHash"] = signed;

  const paymentUrl = `${vnp_Url}?${qs.stringify(sortedParams, {
    encode: false,
  })}`;
console.log("signData:", signData);
console.log("signed:", signed);
console.log("paymentUrl:", paymentUrl); 
  return NextResponse.json({ url: paymentUrl });
}

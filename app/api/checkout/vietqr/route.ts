import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
    try {
        const { plan, userId } = await req.json();

        if (!plan || !userId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Use environment variables for VietQR config
        const vietQrUrl = process.env.VIETQR_API_URL + "/generate";
        const clientId = process.env.VIETQR_CLIENT_ID;
        const apiKey = process.env.VIETQR_API_KEY;
        const accountNo = process.env.VIETQR_ACCOUNT_NO;
        const accountName = process.env.VIETQR_ACCOUNT_NAME;
        const acqId = process.env.VIETQR_ACQ_ID;
        const template = process.env.VIETQR_DEFAULT_TEMPLATE || "print";
        const exchangeRate = Number(process.env.VIETQR_EXCHANGE_RATE) || 25000;

        // Calculate amount in VND
        const amount = Math.round(plan.total * exchangeRate);

        // Create description (addInfo)
        const description = `Payment for ${plan.name} user ${userId}`;

        // Payload for VietQR
        const payload = {
            accountNo: accountNo,
            accountName: accountName,
            acqId: acqId,
            amount: amount,
            addInfo: description,
            format: "text",
            template: template,
        };

        const response = await axios.post(vietQrUrl, payload, {
            headers: {
                "x-client-id": clientId,
                "x-api-key": apiKey,
                "Content-Type": "application/json",
            },
        });

        if (response.data && response.data.code === "00") {
            return NextResponse.json({
                data: response.data.data,
                qrDataURL: response.data.data.qrDataURL
            });
        } else {
            console.error("VietQR Error:", response.data);
            return new NextResponse("Failed to generate QR code", { status: 500 });
        }

    } catch (error) {
        console.error("[VIETQR_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

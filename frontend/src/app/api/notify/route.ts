import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@promarket.ru';

export async function POST(req: Request) {
  try {
    const { orderId, user, amount, items } = await req.json();

    // 1. Telegram Notification
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const tgMessage = `
🚀 *Новый Заказ!*
--------------------
🆔 ID: ${orderId}
👤 Клиент: ${user}
💰 Сумма: ${amount}
📦 Товаров: ${items} шт.

Срочно проверьте админ-панель!
      `;
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: tgMessage,
          parse_mode: 'Markdown',
        }),
      });
    }

    // 2. Email Notification
    if (EMAIL_USER && EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Misol uchun Gmail
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      });

      const mailOptions = {
        from: EMAIL_USER,
        to: ADMIN_EMAIL,
        subject: `Новый заказ #${orderId}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #f9f9f9;">
            <h2 style="color: #2563eb;">Новый Заказ #${orderId}</h2>
            <p><strong>Клиент:</strong> ${user}</p>
            <p><strong>Сумма:</strong> ${amount}</p>
            <p><strong>Количество товаров:</strong> ${items}</p>
            <hr />
            <p style="font-size: 12px; color: #666;">Это автоматическое уведомление от PRO MARKET.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ success: false, error: 'Notification failed' }, { status: 500 });
  }
}

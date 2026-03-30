import { NextRequest, NextResponse } from 'next/server';

// Telegram Bot orqali bildirishnoma yuborish
async function sendTelegramNotification(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.warn('Telegram credentials missing: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    if (!res.ok) {
      console.error('Telegram API error:', await res.text());
    }
  } catch (err) {
    console.error('Failed to send Telegram notification:', err);
  }
}

import nodemailer from 'nodemailer';

// Email yuborish funksiyasi
async function sendEmailNotification(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"PRO MARKET" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
  } catch (err) {
    console.error('Failed to send Email notification:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, address, items, total, promoCode } = body;

    if (!name || !phone || !items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Malumotlar yetarli emas' }, { status: 400 });
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    // Buyurtma ma'lumotlarini formatlaymiz
    const itemsList = items.map((item: { name: string; quantity: number; price: number }) =>
      `◽️ <b>${item.name}</b> x${item.quantity} — <code>$${item.price * item.quantity}</code>`
    ).join('\n');

    const telegramMessage = `
🚀 <b>Yangi buyurtma qabul qilindi! #${orderId}</b>

👤 <b>Mijoz:</b> ${name}
📞 <b>Telefon:</b> <code>${phone}</code>
📍 <b>Manzil:</b> ${address}
${promoCode ? `🏷 <b>Promo-kod:</b> <code>${promoCode}</code>` : ''}

📦 <b>Mahsulotlar:</b>
${itemsList}

💰 <b>Jami summa:</b> <b>$${total}</b>

📅 ${new Date().toLocaleString('uz-UZ')}
    `.trim();

    // 1. Strapi-ga saqlash
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const strapiRes = await fetch(`${strapiUrl}/api/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` // Agar kerak bo'lsa
      },
      body: JSON.stringify({
        data: {
          orderNumber: orderId,
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          items: items,
          totalPrice: total,
          promoCode: promoCode || '',
          status: 'yangi'
        }
      })
    });

    if (!strapiRes.ok) {
      const errorData = await strapiRes.json();
      console.error('Strapi Order Creation Error:', errorData);
      throw new Error('Strapi-ga saqlashda xatolik');
    }

    // 2. Telegram va Email bildirishnomalari (parallel ravishda)
    await Promise.allSettled([
      sendTelegramNotification(telegramMessage),
      sendEmailNotification(
        process.env.ADMIN_EMAIL || 'admin@promarket.uz',
        `🚀 Yangi buyurtma #${orderId} — ${name}`,
        `<h2>Yangi buyurtma</h2><p>${telegramMessage.replace(/\n/g, '<br>')}</p>`
      )
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Buyurtma muvaffaqiyatli qabul qilindi!',
      orderId 
    });

  } catch (error: any) {
    console.error('Order Logic Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Xatolik yuz berdi' 
    }, { status: 500 });
  }
}

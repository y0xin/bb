import { Core } from '@strapi/strapi';

export default async (strapi: Core.Strapi) => {
  try {
    const roles = await strapi.db.query('plugin::users-permissions.role').findMany();
    const roleNames = roles.map((r: any) => r.name);

    const rolesToCreate = ['Superadmin', 'Manager', 'Moderator', 'Support'];
    for (const roleName of rolesToCreate) {
      if (!roleNames.includes(roleName)) {
        await strapi.db.query('plugin::users-permissions.role').create({
          data: {
            name: roleName,
            description: `${roleName} roli`,
            type: roleName.toLowerCase(),
          }
        });
        console.log(`Role "${roleName}" yaratildi`);
      }
    }

    const superadminRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { name: 'Superadmin' }
    });

    if (superadminRole) {
      const adminUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { username: 'admin' }
      });

      if (!adminUser) {
        await (strapi.plugin('users-permissions').service('user') as any).add({
          username: 'admin',
          email: 'admin@market.uz',
          password: 'admin123',
          role: superadminRole.id,
          confirmed: true,
        });
        console.log('Admin foydalanuvchisi yaratildi: admin / admin123');
      }
    }

    // 1. Kategoriyalar
    const categoriesCount = await strapi.db.query('api::category.category').count();
    if (categoriesCount === 0) {
      const categories = [
        { name: 'Elektronika', slug: 'elektronika', icon: 'Cpu' },
        { name: 'Maishiy texnika', slug: 'maishiy-texnika', icon: 'Smartphone' },
        { name: 'Aksessuarlar', slug: 'aksessuarlar', icon: 'Watch' },
        { name: 'Geyming', slug: 'geyming', icon: 'Gamepad' },
        { name: 'Audio', slug: 'audio', icon: 'Headphones' }
      ];

      for (const cat of categories) {
        await strapi.entityService.create('api::category.category', { 
          data: { ...cat, publishedAt: new Date() } 
        } as any);
      }
      console.log('Kategoriyalar yaratildi');
    }

    // 2. Mahsulotlar
    const productsCount = await strapi.db.query('api::product.product').count();
    if (productsCount === 0) {
      const cats = await (strapi.entityService.findMany('api::category.category') as any);
      const products = [
        { name: 'iPhone 15 Pro Max', price: 1200, oldPrice: 1350, category: cats.find((c: any) => c.slug === 'elektronika')?.id, rating: 5, stock: 10, description: 'Apple flagship smartphone.' },
        { name: 'MacBook Pro 14 M3', price: 2000, oldPrice: 2200, category: cats.find((c: any) => c.slug === 'elektronika')?.id, rating: 4.8, stock: 5, description: 'Powerful laptop for pros.' },
        { name: 'Samsung S24 Ultra', price: 1100, oldPrice: 1250, category: cats.find((c: any) => c.slug === 'elektronika')?.id, rating: 4.9, stock: 8, description: 'Android flagship with AI.' },
        { name: 'Sony PlayStation 5 Slim', price: 550, category: cats.find((c: any) => c.slug === 'geyming')?.id, rating: 5, stock: 15, description: 'Next-gen gaming console.' },
        { name: 'AirPods Max', price: 550, category: cats.find((c: any) => c.slug === 'audio')?.id, rating: 4.7, stock: 12, description: 'Premium over-ear headphones.' },
        { name: 'Dyson V15 Detect', price: 800, category: cats.find((c: any) => c.slug === 'maishiy-texnika')?.id, rating: 4.9, stock: 6, description: 'Smart cordless vacuum.' }
      ];

      for (const prod of products) {
        await strapi.entityService.create('api::product.product', { 
          data: { ...prod, publishedAt: new Date() } 
        } as any);
      }
      console.log('Mahsulotlar yaratildi');
    }

    // 3. Viktorina savollari
    const quizCount = await strapi.db.query('api::quiz-question.quiz-question').count();
    if (quizCount === 0) {
      const questions = [
        { question: 'Sizga koʻproq qaysi turdagi mahsulotlar qiziqarli?', options: ['Elektronika', 'Maishiy texnika', 'Aksessuarlar', 'Barchasi'] },
        { question: 'Budjetingiz qancha?', options: ['$100 - $500', '$500 - $1000', '$1000 - $2000', 'Cheksiz'] },
        { question: 'Brend muhimmi?', options: ['Ha, faqat Apple', 'Ha, faqat Samsung', 'Farqi yoʻq, asosiysi sifat', 'Eng arzonini qidiryapman'] }
      ];

      for (const q of questions) {
        await strapi.entityService.create('api::quiz-question.quiz-question', { 
          data: { ...q, publishedAt: new Date() } 
        } as any);
      }
      console.log('Quiz savollari yaratildi');
    }

    // 4. Promo-kodlar
    const promoCount = await strapi.db.query('api::promo-code.promo_code').count();
    if (promoCount === 0) {
      await strapi.entityService.create('api::promo-code.promo_code', {
        data: { code: 'PROMO10', discountPercent: 10, isActive: true, publishedAt: new Date() }
      } as any);
      await strapi.entityService.create('api::promo-code.promo_code', {
        data: { code: 'WELCOME20', discountPercent: 20, isActive: true, publishedAt: new Date() }
      } as any);
      console.log('Promo-kodlar yaratildi');
    }

    // 5. Bannerlar
    const bannersCount = await strapi.db.query('api::banner.banner').count();
    if (bannersCount === 0) {
      await strapi.entityService.create('api::banner.banner', {
        data: { title: 'Yozgi Chegirmalar!', subtitle: 'Barcha smartfonlarga 20% gacha aksiyalar', position: 'hero', isActive: true, publishedAt: new Date() }
      } as any);
      await strapi.entityService.create('api::banner.banner', {
        data: { title: 'Yangi Kelganlar', subtitle: 'Eng soʻnggi geyming noutbuklari bizda', position: 'hero', isActive: true, publishedAt: new Date() }
      } as any);
      console.log('Bannerlar yaratildi');
    }

    // 6. Portfolio
    const portfolioCount = await strapi.db.query('api::portfolio.portfolio').count();
    if (portfolioCount === 0) {
      const projects = [
        { title: 'Smart Home System', description: 'Panel upravleniya dlya sistemi umnogo doma.', tag: 'IoT' },
        { title: 'E-Commerce Platform', description: 'Krupniy proekt internet-magazina.', tag: 'Web' },
        { title: 'Mobile Banking App', description: 'Dizayn sovremennogo mobilnogo bankinga.', tag: 'Mobile' }
      ];
      for (const p of projects) {
        await strapi.entityService.create('api::portfolio.portfolio', {
          data: { ...p, publishedAt: new Date() }
        } as any);
      }
      console.log('Portfolio yaratildi');
    }

    // 7. FAQ
    const faqCount = await strapi.db.query('api::faq.faq').count();
    if (faqCount === 0) {
      const faqs = [
        { question: 'Dostavka qancha vaqt oladi?', answer: 'Toshkent boʻylab 24 soat ichida, viloyatlarga 2-3 ish kuni.', category: 'Доставка' },
        { question: 'Toʻlov turlari qanday?', answer: 'Naqd pul, Payme, Click va bank kartalari orqali.', category: 'Оплата' },
        { question: 'Kafolat bormi?', answer: 'Barcha mahsulotlarimizga 1 yildan 2 yilgacha rasmiy kafolat beriladi.', category: 'Гарантия' }
      ];
      for (const f of faqs) {
        await strapi.entityService.create('api::faq.faq', {
          data: { ...f, publishedAt: new Date() }
        } as any);
      }
      console.log('FAQ yaratildi');
    }

    // 5. Ruxsatlar (Role Permissions)
    const setupPermissions = async (roleName: string, actions: string[]) => {
      const role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { name: roleName }
      });
      if (role) {
        for (const action of actions) {
          const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { action, role: role.id }
          });
          if (!existing) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: { action, role: role.id }
            });
          }
        }
        console.log(`"${roleName}" ruxsatlari yangilandi`);
      }
    };

    // Public permissions
    await setupPermissions('Public', [
      'api::product.product.find',
      'api::product.product.findOne',
      'api::category.category.find',
      'api::category.category.findOne',
      'api::quiz-question.quiz_question.find',
      'api::quiz-submission.quiz_submission.create',
      'api::order.order.create',
      'api::promo-code.promo_code.find',
      'api::chat-message.chat_message.create',
      'api::portfolio.portfolio.find',
      'api::faq.faq.find',
      'api::banner.banner.find'
    ]);

    // Manager permissions
    await setupPermissions('Manager', [
      'api::product.product.find',
      'api::product.product.findOne',
      'api::product.product.create',
      'api::product.product.update',
      'api::product.product.delete',
      'api::category.category.find',
      'api::category.category.findOne',
      'api::category.category.create',
      'api::category.category.update',
      'api::order.order.find',
      'api::order.order.findOne',
      'api::order.order.update',
      'api::chat-message.chat_message.find',
      'api::chat-message.chat_message.create',
      'api::chat-message.chat_message.update',
      'api::banner.banner.find',
      'api::banner.banner.create',
      'api::banner.banner.update',
      'api::portfolio.portfolio.find',
      'api::portfolio.portfolio.create',
      'api::portfolio.portfolio.update',
      'api::faq.faq.find',
      'api::faq.faq.create',
      'api::faq.faq.update'
    ]);

    // Superadmin (Full Access to these APIs)
    await setupPermissions('Superadmin', [
      'api::product.product.find',
      'api::product.product.findOne',
      'api::product.product.create',
      'api::product.product.update',
      'api::product.product.delete',
      'api::category.category.find',
      'api::category.category.findOne',
      'api::category.category.create',
      'api::category.category.update',
      'api::category.category.delete',
      'api::order.order.find',
      'api::order.order.findOne',
      'api::order.order.update',
      'api::order.order.delete',
      'api::chat-message.chat_message.find',
      'api::chat-message.chat_message.findOne',
      'api::chat-message.chat_message.create',
      'api::chat-message.chat_message.update',
      'api::chat-message.chat_message.delete',
      'api::promo-code.promo_code.find',
      'api::promo-code.promo_code.create',
      'api::promo-code.promo_code.update',
      'api::promo-code.promo_code.delete',
      'api::banner.banner.find',
      'api::banner.banner.create',
      'api::banner.banner.update',
      'api::banner.banner.delete',
      'api::portfolio.portfolio.find',
      'api::portfolio.portfolio.create',
      'api::portfolio.portfolio.update',
      'api::portfolio.portfolio.delete',
      'api::faq.faq.find',
      'api::faq.faq.create',
      'api::faq.faq.update',
      'api::faq.faq.delete',
      'api::site-config.site_config.find',
      'api::site-config.site_config.update',
      'plugin::users-permissions.user.find',
      'plugin::users-permissions.user.findOne',
      'plugin::users-permissions.user.create',
      'plugin::users-permissions.user.update',
      'plugin::users-permissions.user.delete',
      'plugin::users-permissions.role.find'
    ]);

  } catch (err) {
    console.error('Seeding error:', err);
  }
};

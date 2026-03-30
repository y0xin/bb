/**
 * Strapi Role Configuration Guide
 * 
 * Loyihada 4 xil rol ishlatiladi. Strapi Admin panelida quyidagicha sozlanadi:
 * Settings -> Administration Panel -> Roles
 * 
 * 1. SUPER ADMIN (Bosh administrator)
 *    - Barcha funksiyalarga to'liq kirish
 *    - Rollarni boshqarish
 *    - Tizim sozlamalari
 * 
 * 2. MANAGER (Menejer)
 *    - Mahsulotlarni CRUD (yaratish, o'qish, yangilash, o'chirish)
 *    - Buyurtmalar statusini o'zgartirish
 *    - Bannerlarni boshqarish
 *    - Excel import/export
 *    - Chat xabarlarini o'qish va javob berish
 * 
 * 3. MODERATOR (Moderator)
 *    - Mahsulotlarni ko'rish va tahrirlash (o'chira olmaydi)
 *    - Buyurtmalarni ko'rish
 *    - FAQ/Savollarni moderatsiya qilish
 *    - Chat xabarlarini o'qish
 * 
 * 4. SUPPORT (Qo'llab-quvvatlash)
 *    - Buyurtmalarni ko'rish (faqat o'qish)
 *    - Chat xabarlarini o'qish va javob berish
 *    - Mahsulotlarni ko'rish (faqat o'qish)
 */

module.exports = {
  async bootstrap({ strapi }) {
    // Rollarni avtomatik yaratish (agar mavjud bo'lmasa)
    const existingRoles = await strapi.service('admin::role').findAll();
    const roleNames = existingRoles.map(r => r.name);

    const rolesToCreate = [
      {
        name: 'Manager',
        code: 'strapi-manager',
        description: 'Mahsulotlar, buyurtmalar va bannerlarni boshqaradi',
      },
      {
        name: 'Moderator',
        code: 'strapi-moderator',
        description: 'Kontentni moderatsiya qiladi, savollarni tekshiradi',
      },
      {
        name: 'Support',
        code: 'strapi-support',
        description: 'Mijozlar bilan muloqot qiladi, buyurtmalarni kuzatadi',
      },
    ];

    for (const role of rolesToCreate) {
      if (!roleNames.includes(role.name)) {
        try {
          await strapi.service('admin::role').create(role);
          strapi.log.info(`Role "${role.name}" yaratildi`);
        } catch (e) {
          strapi.log.warn(`Role "${role.name}" yaratishda xatolik: ${e.message}`);
        }
      }
    }
  },
};

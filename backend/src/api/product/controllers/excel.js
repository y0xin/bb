'use strict';

const XLSX = require('xlsx');

module.exports = {
  // Mahsulotlarni Excel faylga eksport qilish
  async exportProducts(ctx) {
    try {
      const products = await strapi.entityService.findMany('api::product.product', {
        populate: ['category', 'image'],
      });

      const data = products.map(p => ({
        'ID': p.id,
        'Nomi': p.name,
        'Slug': p.slug,
        'Narxi': p.price,
        'Eski narxi': p.oldPrice || '',
        'Kategoriya': p.category?.name || '',
        'Reyting': p.rating,
        'Ombordagi soni': p.stock,
        'Tavsif': p.description || '',
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Ustun kengliklarini sozlash
      worksheet['!cols'] = [
        { wch: 5 }, { wch: 30 }, { wch: 30 }, { wch: 12 },
        { wch: 12 }, { wch: 20 }, { wch: 8 }, { wch: 12 }, { wch: 50 },
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Mahsulotlar');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      ctx.set('Content-Disposition', 'attachment; filename=products.xlsx');
      ctx.body = buffer;
    } catch (err) {
      ctx.throw(500, err.message);
    }
  },

  // Excel fayldan mahsulotlarni import qilish
  async importProducts(ctx) {
    try {
      const { files } = ctx.request;
      if (!files || !files.file) {
        return ctx.throw(400, 'Excel fayl yuklang');
      }

      const workbook = XLSX.readFile(files.file.filepath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      const results = { created: 0, updated: 0, errors: [] };

      for (const row of rows) {
        try {
          const existingProduct = row['ID']
            ? await strapi.entityService.findOne('api::product.product', row['ID'])
            : null;

          const productData = {
            name: row['Nomi'],
            slug: row['Slug'],
            price: parseFloat(row['Narxi']) || 0,
            oldPrice: row['Eski narxi'] ? parseFloat(row['Eski narxi']) : null,
            rating: parseFloat(row['Reyting']) || 5.0,
            stock: parseInt(row['Ombordagi soni']) || 0,
            description: row['Tavsif'] || '',
          };

          // Kategoriyani topish yoki yaratish
          if (row['Kategoriya']) {
            let category = await strapi.db.query('api::category.category').findOne({
              where: { name: row['Kategoriya'] },
            });
            if (!category) {
              category = await strapi.entityService.create('api::category.category', {
                data: { name: row['Kategoriya'], slug: row['Kategoriya'].toLowerCase().replace(/\s+/g, '-') },
              });
            }
            productData.category = category.id;
          }

          if (existingProduct) {
            await strapi.entityService.update('api::product.product', existingProduct.id, { data: productData });
            results.updated++;
          } else {
            await strapi.entityService.create('api::product.product', { data: productData });
            results.created++;
          }
        } catch (rowError) {
          results.errors.push({ row: row['Nomi'] || 'Noma\'lum', error: rowError.message });
        }
      }

      ctx.body = {
        message: `Import yakunlandi: ${results.created} yaratildi, ${results.updated} yangilandi`,
        ...results,
      };
    } catch (err) {
      ctx.throw(500, err.message);
    }
  },
};

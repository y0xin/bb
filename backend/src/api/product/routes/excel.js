'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/products/export-excel',
      handler: 'excel.exportProducts',
      config: { policies: [] },
    },
    {
      method: 'POST',
      path: '/products/import-excel',
      handler: 'excel.importProducts',
      config: { policies: [] },
    },
  ],
};

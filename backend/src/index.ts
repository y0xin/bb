import type { Core } from '@strapi/strapi';
import { Server } from 'socket.io';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // @ts-ignore
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // @ts-ignore
    strapi.io = io;

    io.on('connection', (socket) => {
      console.log('Foydalanuvchi suhbatga qo\'shildi:', socket.id);

      socket.on('sendMessage', async (data) => {
        try {
          // @ts-ignore
          await strapi.entityService.create('api::chat-message.chat-message', {
            data: {
              text: data.text,
              sender: data.sender,
              sessionId: data.sessionId,
              messageType: data.type || 'text',
              timestamp: new Date(),
              publishedAt: new Date(),
            },
          });
          io.emit('receiveMessage', data);
        } catch (error) {
          console.error('Xabarni saqlashda xatolik:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('Foydalanuvchi suhbatdan chiqdi');
      });
    });

    // Seeding logic
    try {
      const seed = require('./scripts/seed').default;
      await seed(strapi);
    } catch (err) {
      console.error('Bootstrap seeding error:', err);
    }
  },
};

import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    async checkHealth(): Promise<void> {
        return this.$queryRawUnsafe('SELECT 1;');
    }

    async enableShutdownHooks(app: INestApplication) {
        process.on('beforeExit', () => {
          app.close();
        });
      }
}

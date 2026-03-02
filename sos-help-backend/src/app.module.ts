import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SosModule } from './sos/sos.module';
import { ActionsModule } from './actions/actions.module';

@Module({
  imports: [
    // โหลดไฟล์ .env
    ConfigModule.forRoot({ isGlobal: true }),
    // เชื่อมต่อ MongoDB แบบ Async 
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    UsersModule,
    AuthModule,
    SosModule,
    ActionsModule,
  ],
})
export class AppModule {}
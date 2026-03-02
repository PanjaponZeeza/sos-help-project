import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller';
import { Action, ActionSchema } from './schemas/action.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Action.name, schema: ActionSchema }]),
    AuthModule,
  ],
  providers: [ActionsService],
  controllers: [ActionsController],
})
export class ActionsModule {}
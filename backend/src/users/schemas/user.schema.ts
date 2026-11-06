import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  handle: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

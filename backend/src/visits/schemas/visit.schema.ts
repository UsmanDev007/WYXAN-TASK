import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VisitDocument = Visit & Document;

export type VisitSource = 'typed' | 'link' | 'history' | 'back_forward' | 'search';

@Schema({ timestamps: true })
export class Visit {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  address: string;

  @Prop({ required: true })
  siteTitle: string;

  @Prop({ required: true, default: 'typed' })
  source: VisitSource;

  @Prop({ required: true, default: Date.now, index: true })
  timestamp: Date;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);

VisitSchema.index({ userId: 1, timestamp: -1 });

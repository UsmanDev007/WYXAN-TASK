import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SiteDocument = Site & Document;

@Schema({ timestamps: true })
export class Site {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  address: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  htmlContent: string;

  @Prop({ required: true })
  authorId: string;

  @Prop({ required: true })
  authorName: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SiteSchema = SchemaFactory.createForClass(Site);

// Full text search index on title and htmlContent (and address)
SiteSchema.index({ title: 'text', htmlContent: 'text', address: 'text' });

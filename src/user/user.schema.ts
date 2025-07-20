import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  username: string;

  @Prop()
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone: number;

  @Prop({ default: false })
  status: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  verifyToken: string;

  @Prop()
  verifyTokenExp: Date;

  @Prop()
  refreshToken: string;
}

export const userSchema = SchemaFactory.createForClass(User);

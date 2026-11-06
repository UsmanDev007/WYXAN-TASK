import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class RecordVisitDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsIn(['typed', 'link', 'history', 'back_forward', 'search'])
  source: 'typed' | 'link' | 'history' | 'back_forward' | 'search';
}

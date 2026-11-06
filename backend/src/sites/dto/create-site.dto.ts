import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9.-]+\.[a-z]{2,}$/i, {
    message: 'Address must be a valid domain format (e.g., tidepool.zz, journal.web)',
  })
  address: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  htmlContent: string;

  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsNotEmpty()
  authorName: string;
}

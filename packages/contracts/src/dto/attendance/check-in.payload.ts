import { IsString, IsUUID, Length, Matches } from 'class-validator';

export class CheckInPayload {
  @IsUUID('7')
  employeeId: string;

  @IsString()
  @Length(1, 20)
  employeeCode: string;

  @IsString()
  @Length(1, 100)
  employeeName: string;

  @Matches(/^[\w-]+(\/[\w-]+)*\.(jpg|png|webp)$/)
  photoKey: string;
}

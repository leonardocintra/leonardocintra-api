import { IsBoolean } from 'class-validator';

export class UpdateAfiliadosStatusDto {
  @IsBoolean()
  active!: boolean;
}
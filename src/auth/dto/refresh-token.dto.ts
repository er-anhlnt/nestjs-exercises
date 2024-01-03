import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RefreshTokenResponse {
  @Expose()
  token: string;

  @Expose()
  token_type: string;

  @Expose()
  expires_in: number;
}



export class AuthResponseDto<T> {
  statusCode: number;
  status: string;
  message: string;
  data: T;
}
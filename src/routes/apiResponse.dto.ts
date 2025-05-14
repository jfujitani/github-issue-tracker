import { ErrorDto } from './error.dto';

export type ApiResponse<T> = T | ErrorDto;

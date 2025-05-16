export type ApiResponse<T> = T | ErrorDto;

export type ErrorDto = {
  error: string;
  message?: string;
};

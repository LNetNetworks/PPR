import { ApiProperty } from "@nestjs/swagger";

export class SuccessResponseDto<T = any> {
  @ApiProperty({
    description: "Indicates if the operation was successful",
    example: true,
  })
  Success: boolean;

  @ApiProperty({ description: "Response data" })
  data: T;
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty({
    description: "Indicates if the operation was successful",
    example: true,
  })
  Success: boolean;

  @ApiProperty({ description: "Response data array" })
  data: T[];

  @ApiProperty({
    description: "Pagination filters",
    example: { limit: 50, offset: 0 },
  })
  filters: {
    limit: number;
    offset: number;
    [key: string]: any;
  };
}

export class ErrorResponseDto {
  @ApiProperty({ description: "Error status code", example: 400 })
  statusCode: number;

  @ApiProperty({ description: "Error message", example: "Bad Request" })
  message: string;

  @ApiProperty({ description: "Error type", example: "BadRequestException" })
  error: string;
}

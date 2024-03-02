import HTTP_CODE from "http-status-codes"
export interface IErrorResponse {
   message: string
   status: string
   statusCode: number
   serializedErrors(): IError;
}
export interface IError {
   message: string
   status: string
   statusCode: number
}
export abstract class ErrorCustom extends Error {
   abstract statusCode: number
   abstract status: string
   constructor(message: string) {
      super(message)
      Object.setPrototypeOf(this, ErrorCustom.prototype) // to fix the issue with the instanceof operator
   }
   serializedErrors(): IError {
      return {
         message: this.message,
         status: this.status,
         statusCode: this.statusCode
      }
   }
}
export class BadRequestError extends ErrorCustom {
   statusCode = HTTP_CODE.BAD_REQUEST
   status = "Bad Request"
   constructor(public message: string) {
      super(message)
   }
}
export class NotFoundError extends ErrorCustom {
   statusCode = HTTP_CODE.NOT_FOUND
   status = "Not Found"
   constructor(public message: string) {
      super(message)
   }
}
export class InternalServerError extends ErrorCustom {
   statusCode = HTTP_CODE.INTERNAL_SERVER_ERROR
   status = "Internal Server Error"
   constructor(public message: string) {
      super(message)
   }
}
export class UnauthorizedError extends ErrorCustom {
   statusCode = HTTP_CODE.UNAUTHORIZED
   status = "Unauthorized"
   constructor(public message: string) {
      super(message)
   }
}
export class ForbiddenError extends ErrorCustom {
   statusCode = HTTP_CODE.FORBIDDEN
   status = "Forbidden"
   constructor(public message: string) {
      super(message)
   }
}

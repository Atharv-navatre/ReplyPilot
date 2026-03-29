import { Request, Response, NextFunction } from "express"

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("[Error]", error.message)

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : error.message
  })
}

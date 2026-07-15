import { Request, Response } from 'express';
import { ReportService } from '../service/reportService';
import { GenerateReportDto } from '../dtos/reportdto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import path from 'path';
import fs from 'fs';

export class ReportController {

  static async generateReport(req: Request, res: Response) {
    try {
      const dto = plainToInstance(GenerateReportDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const result = await ReportService.generateReport(dto, req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
  }

  static async downloadReport(req: Request, res: Response) {
    try {
      const filePath = path.join(
        __dirname, 
        '../reports', 
        req.params.filename
      );

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.download(filePath);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
  }
}
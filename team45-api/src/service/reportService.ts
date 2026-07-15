import { FoodListing } from '../models/food_listing';
import { Donor } from '../models/donor';
import { GenerateReportDto, ReportResultDto, ReportType } from '../dtos/reportdto';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';


const KG_VALUE = 5; 
const MEALS_PER_KG = 3;
const CO2_SAVED_PER_KG = 0.5; 

export class ReportService {
  static async generateReport(dto: GenerateReportDto, donorId: string): Promise<ReportResultDto> {
    //
    const donor = await Donor.findByPk(donorId, { include: ['user'] });
    const donations = await this.getDonations(donorId, dto);

    if (donations.length === 0) {
      throw new Error('No donations found for the selected period');
    }

    
    const metrics = this.calculateMetrics(donations);


    const { fileName, filePath } = await this.generatePdf(
      dto.type,
      donor!,
      donations,
      metrics
    );

    return {
      fileName,
      downloadUrl: `/reports/download/${fileName}`,
      metrics
    };
  }

  private static async getDonations(donorId: string, dto: GenerateReportDto) {
    const where: any = { donor_id: donorId };

    if (dto.startDate && dto.endDate) {
      where.created_at = {
        [Op.between]: [new Date(dto.startDate), new Date(dto.endDate)]
      };
    }

    return await FoodListing.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
  }

  private static calculateMetrics(donations: FoodListing[]) {
    const totalKg = donations.reduce((sum, d) => sum + (d.posted_quantity || 0), 0);

    return {
      totalDonations: donations.length,
      totalKg,
      estimatedValue: totalKg * KG_VALUE,
      mealsProvided: totalKg * MEALS_PER_KG,
      co2Saved: totalKg * CO2_SAVED_PER_KG
    };
  }

  private static async generatePdf(
    type: ReportType,
    donor: Donor,
    donations: FoodListing[],
    metrics: any
  ) {
    const fileName = `${type}-report-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../reports', fileName);
    const doc = new PDFDocument(); 

    
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(20)
       .text(`${type.toUpperCase()} REPORT`, { align: 'center' })
       .moveDown();

    // Donor Info
    doc.fontSize(14)
       .text(`Donor: ${donor.user?.name || 'N/A'}`, { underline: true })
       .moveDown();

   switch (type) {
  case ReportType.TAX:
    this.generateTaxContent(doc, donations, metrics);
    break;
  case ReportType.IMPACT:
    this.generateImpactContent(doc, metrics);
    break;
  case ReportType.CSR:
    this.generateCsrContent(doc, donor, donations, metrics);
    break;
  case ReportType.MONTHLY_SUMMARY:
    this.generateMonthlySummary(doc, donations, metrics);
    break;
  default:
    throw new Error('Unsupported report type');
}

doc.fontSize(10)
   .text('Generated on: ' + new Date().toLocaleDateString(), { align: 'right' })
   .moveDown(0.5);
doc.text('© FoodHero Donation System', { align: 'center' });
    doc.end();
    return { fileName, filePath };
  }



 private static generateTaxContent(
  doc: PDFKit.PDFDocument,
  donations: FoodListing[],
  metrics: any
) {
  // Header
  doc.fontSize(16)
     .text('TAX DEDUCTION REPORT', { align: 'center' })
     .moveDown();

  // Summary
  doc.fontSize(12)
     .text(`Total Tax Deductible Value: $${metrics.estimatedValue.toFixed(2)}`, { underline: true })
     .moveDown();

  // Detailed Table
  const tableTop = doc.y;
  const col1 = 50;
  const col2 = 150;
  const col3 = 250;
  const col4 = 350;

  // Table Header
  doc.font('Helvetica-Bold')
     .text('Date', col1, tableTop)
     .text('Category', col2)
     .text('Quantity', col3)
     .text('Value', col4)
     .moveDown();

  // Table Rows
  let y = doc.y;
  donations.forEach(d => {
    const value = (d.posted_quantity || 0) * KG_VALUE;
    
    doc.font('Helvetica')
       .text(d.created_at.toLocaleDateString(), col1, y)
       .text(d.food_category || 'N/A', col2)
       .text(`${d.posted_quantity} kg`, col3)
       .text(`$${value.toFixed(2)}`, col4);
    
    y += 20;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;
  });

  // Tax Certification
  doc.moveDown(2)
     .fontSize(10)
     .text('This document serves as official certification for tax deduction purposes.', { align: 'center' })
     .text('Rescue Produce Organization EIN: 12-3456789', { align: 'center' });
}

private static generateImpactContent(
  doc: PDFKit.PDFDocument,
  metrics: any
) {
  
  doc.fontSize(16)
     .text('ENVIRONMENTAL IMPACT REPORT', { align: 'center' })
     .moveDown();

  
  doc.fontSize(12)
     .text('Your donations have resulted in:', { underline: true })
     .moveDown(0.5)
     .text(`✓ ${metrics.totalKg} kg of food rescued from waste`)
     .text(`✓ ${metrics.mealsProvided} meals provided to those in need`)
     .text(`✓ ${metrics.co2Saved.toFixed(2)} kg of CO₂ emissions prevented`)
     .moveDown();


  this.drawImpactChart(doc, metrics);


  doc.moveDown()
     .fontSize(10)
     .text('Based on USDA estimates: 1kg food = 3 meals = 0.5kg CO₂ reduction', { align: 'center' });
}

private static generateCsrContent(
  doc: PDFKit.PDFDocument,
  donor: Donor,
  donations: FoodListing[],
  metrics: any
) {
  // Header
  doc.fontSize(16)
     .text('CORPORATE SOCIAL RESPONSIBILITY REPORT', { align: 'center' })
     .moveDown();

  // Company Info
  doc.fontSize(12)
     .text(`Prepared for: ${donor.user?.name || 'N/A'}`, { underline: true })
     .moveDown(0.5);

  // CSR Metrics
  doc.text(`Total Donations: ${metrics.totalDonations}`)
     .text(`Total Food Donated: ${metrics.totalKg} kg`)
     .text(`Community Impact Score: ${(metrics.totalKg * 10).toFixed(0)}/100`)
     .moveDown();

  // Monthly Breakdown
  doc.text('Monthly Donation Trend:', { underline: true })
     .moveDown(0.5);
  this.drawMonthlyTrendChart(doc, donations);

  // Certification
  doc.moveDown()
     .fontSize(10)
     .text('This report meets GRI Standards for sustainability reporting', { align: 'center' });
}

private static generateMonthlySummary(
  doc: PDFKit.PDFDocument,
  donations: FoodListing[],
  metrics: any
) {
  
  doc.fontSize(16)
     .text('MONTHLY DONATION SUMMARY', { align: 'center' })
     .moveDown();

  // Summary Table
  const months = this.groupByMonth(donations);
  const tableTop = doc.y;
  const col1 = 50;
  const col2 = 200;
  const col3 = 350;

  // Table Header
  doc.font('Helvetica-Bold')
     .text('Month', col1, tableTop)
     .text('Donations', col2)
     .text('Total (kg)', col3)
     .moveDown();

  // Table Rows
  let y = doc.y;
  Object.entries(months).forEach(([month, data]) => {
    const totalKg = data.reduce((sum, d) => sum + (d.posted_quantity || 0), 0);
    
    doc.font('Helvetica')
       .text(month, col1, y)
       .text(data.length.toString(), col2)
       .text(totalKg.toString(), col3);
    
    y += 20;
  });

  
  doc.moveDown(2)
     .fontSize(12)
     .text(`Year to Date Total: ${metrics.totalKg} kg`, { underline: true });
}

  private static drawImpactChart(doc:typeof  PDFDocument, metrics: any) {
    const maxWidth = 200;
    const barHeight = 20;
    const spacing = 30;

    doc.text('Food Donated:').moveDown(0.5);
    doc.rect(50, doc.y, (metrics.totalKg / 100) * maxWidth, barHeight)
       .fill('#4CAF50');
    doc.moveDown(2);


    doc.text('CO₂ Saved:').moveDown(0.5);
    doc.rect(50, doc.y, (metrics.co2Saved / 50) * maxWidth, barHeight)
       .fill('#2196F3');
  }
private static groupByMonth(donations: FoodListing[]): Record<string, FoodListing[]> {
  return donations.reduce((acc: Record<string, FoodListing[]>, donation: FoodListing) => {
    const date = new Date(donation.created_at);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(donation);
    return acc;
  }, {} as Record<string, FoodListing[]>);
}

private static drawMonthlyTrendChart(doc: PDFKit.PDFDocument, donations: FoodListing[]) {
  const monthlyData = this.groupByMonth(donations);
  const months = Object.keys(monthlyData);
  const values = Object.values(monthlyData).map((monthDonations: FoodListing[]) => 
    monthDonations.reduce((sum: number, d: FoodListing) => sum + (d.posted_quantity || 0), 0)
  );
  const maxValue = Math.max(...values, 1);
  const chartHeight = 150;
  const chartWidth = 400;
  const barWidth = chartWidth / months.length;
  const startY = doc.y + 20;

  // Chart title
  doc.fontSize(12)
     .text('Monthly Donation Trend (kg)', { align: 'center' })
     .moveDown(0.5);

  // Draw bars
  months.forEach((month: string, i: number) => {
    const barHeight = (values[i] / maxValue) * chartHeight;
    doc.rect(50 + (i * barWidth), startY + chartHeight - barHeight, barWidth - 5, barHeight)
       .fill(i % 2 === 0 ? '#4CAF50' : '#8BC34A');
    
    // Month labels
    doc.fontSize(8)
       .text(month.substring(0, 3), 50 + (i * barWidth), startY + chartHeight + 5, {
         width: barWidth,
         align: 'center'
       });
  });

  // Y-axis labels
  doc.fontSize(8)
     .text('0', 30, startY + chartHeight)
     .text(maxValue.toFixed(0), 30, startY);

  // Chart border
  doc.rect(50, startY, chartWidth, chartHeight).stroke();

  doc.moveDown(3);
}
}
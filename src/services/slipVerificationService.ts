const { Jimp } = require('jimp');
import jsQR from 'jsqr';
import fs from 'fs';
import axios from 'axios';

// PaddleOCR is the primary choice (CPU-based, more accurate for Thai)
const PADDLEOCR_URL = process.env.PADDLEOCR_URL || 'http://localhost:8082';

export interface SlipVerificationResult {
  success: boolean;
  message: string;
  data?: {
    transRef?: string;
    amount?: number;
    rawPayload?: string;
    ocrText?: string;
    senderName?: string;
    senderAccountNo?: string;
    senderBank?: string;
    receiverName?: string;
    receiverAccountNo?: string;
    receiverBank?: string;
    transactionDate?: string;
  };
}

export class SlipVerificationService {
  private ocrAvailable = false;
  private readonly BANK_CODES = ['TTB', 'SCB', 'KBANK', 'KTB', 'BBL', 'BAY', 'TMB', 'GSB', 'CIMB', 'UOB', 'LHBANK', 'TISCO', 'BAAC', 'KKP', 'TBANK', 'ICBC', 'TCD', 'GHBANK'];

  constructor() {
    this.checkOCRAvailability();
  }

  private async checkOCRAvailability() {
    try {
      const response = await axios.get(`${PADDLEOCR_URL}/health`, { timeout: 3000 });
      if (response.data?.status === 'ok') {
        this.ocrAvailable = true;
        console.log('✅ PaddleOCR is available. Using high-accuracy Thai OCR.');
      }
    } catch {
      console.log('⚠️ PaddleOCR not available. OCR features will not work.');
    }
  }

  async verify(filePath: string): Promise<SlipVerificationResult> {
    // 1. QR Code Scanning (always local)
    const qrRef = await this.scanQRCode(filePath);
    
    // 2. OCR using PaddleOCR
    if (!this.ocrAvailable) {
      // Re-check availability
      await this.checkOCRAvailability();
    }

    let ocrText = '';
    let usedEngine = 'PaddleOCR';

    if (this.ocrAvailable) {
      ocrText = await this.paddleOCR(filePath);
    }

    // Fallback to Tesseract if PaddleOCR failed or is unavailable
    if (!ocrText) {
      console.log('🔄 Falling back to Tesseract.js...');
      ocrText = await this.tesseractOCR(filePath);
      usedEngine = 'Tesseract.js (Fallback)';
    }

    if (!ocrText) {
      return {
        success: false,
        message: 'All OCR engines failed. Please check image quality or OCR service status.'
      };
    }

    // 3. Parse the OCR text
    const parsed = this.parseSlipByPosition(ocrText);

    return {
      success: true,
      message: `Slip processed successfully (${usedEngine})`,
      data: {
        transRef: qrRef || parsed.refNo,
        amount: parsed.amount,
        ocrText: ocrText,
        senderName: parsed.senderName,
        senderAccountNo: parsed.senderAccount,
        senderBank: parsed.senderBank,
        receiverName: parsed.receiverName,
        receiverAccountNo: parsed.receiverAccount,
        receiverBank: parsed.receiverBank,
        transactionDate: parsed.transDate
      }
    };
  }

  private async paddleOCR(filePath: string): Promise<string> {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await axios.post(`${PADDLEOCR_URL}/ocr/slip`, formData, {
        headers: formData.getHeaders(),
        timeout: 30000
      });

      return response.data?.text || '';
    } catch (err: any) {
      console.error('PaddleOCR failed:', err.message);
      return '';
    }
  }

  private async tesseractOCR(filePath: string): Promise<string> {
    try {
      const { createWorker } = require('tesseract.js');
      const worker = await createWorker(['tha', 'eng']);
      
      const { data: { text } } = await worker.recognize(filePath);
      await worker.terminate();
      
      return text;
    } catch (err: any) {
      console.error('Tesseract failed:', err.message);
      return '';
    }
  }

  private parseSlipByPosition(text: string) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let amount: number | undefined;
    let refNo: string | undefined;
    let transDate: string | undefined;
    
    const accountIndices: number[] = [];
    const bankIndices: { idx: number; bank: string }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Amount: X,XXX.XX format
      const amountMatch = line.match(/(\d{1,3}(?:,\d{3})*\.\d{2})/);
      if (amountMatch) {
        const val = parseFloat(amountMatch[1].replace(/,/g, ''));
        if (val > 0 && (!amount || val > amount)) amount = val;
      }

      // Reference: 12-20 digit number with context
      const refMatch = line.match(/(\d{12,20})/);
      if (refMatch && line.match(/รหัส|อ้างอิง|Ref/i)) {
        refNo = refMatch[1];
      }

      // Account numbers
      if (line.match(/[X0-9]{3}[-–][X0-9]{1}[-–][X0-9]{4,5}[-–][X0-9]{1}/i)) {
        accountIndices.push(i);
      }

      // Banks
      for (const bank of this.BANK_CODES) {
        if (line.toUpperCase().includes(bank)) {
          bankIndices.push({ idx: i, bank });
          break;
        }
      }

      // Date
      const dateMatch = line.match(/(\d{1,2}\s*(?:ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)\s*\d{2,4})/i);
      if (dateMatch) transDate = dateMatch[1];
    }

    // Extract names by looking BEFORE account numbers
    const extractName = (accountIdx: number): string | undefined => {
      for (let offset = 1; offset <= 2; offset++) {
        const nameIdx = accountIdx - offset;
        if (nameIdx >= 0) {
          const line = lines[nameIdx];
          if (this.isLikelyName(line)) {
            return this.cleanName(line);
          }
        }
      }
      return undefined;
    };

    const extractAccount = (idx: number): string | undefined => {
      const line = lines[idx];
      const match = line.match(/([X0-9]{3}[-–][X0-9]{1}[-–][X0-9]{4,5}[-–][X0-9]{1})/i);
      return match ? match[1].replace(/[-–]/g, '') : undefined;
    };

    return {
      amount,
      refNo,
      transDate,
      senderName: accountIndices[0] !== undefined ? extractName(accountIndices[0]) : undefined,
      senderAccount: accountIndices[0] !== undefined ? extractAccount(accountIndices[0]) : undefined,
      senderBank: bankIndices[0]?.bank,
      receiverName: accountIndices[1] !== undefined ? extractName(accountIndices[1]) : undefined,
      receiverAccount: accountIndices[1] !== undefined ? extractAccount(accountIndices[1]) : undefined,
      receiverBank: bankIndices[1]?.bank || bankIndices[0]?.bank
    };
  }

  private isLikelyName(line: string): boolean {
    const thaiChars = (line.match(/[ก-๙]/g) || []).length;
    if (thaiChars < 4) return false;
    if (line.length < 5 || line.length > 60) return false;
    
    const skipPatterns = ['สำเร็จ', 'โอนเงิน', 'ค่าธรรมเนียม', 'บาท', 'รหัส', 'อ้างอิง', 'XXX'];
    for (const p of skipPatterns) {
      if (line.includes(p)) return false;
    }
    
    return true;
  }

  private cleanName(name: string): string {
    return name
      .replace(/^\[.*?\]\s*/, '')
      .replace(/:\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async scanQRCode(filePath: string): Promise<string | null> {
    try {
      const buffer = fs.readFileSync(filePath);
      const image = await Jimp.read(buffer);
      const { data, width, height } = image.bitmap;
      const code = jsQR(new Uint8ClampedArray(data), width, height);
      return code ? code.data : null;
    } catch {
      return null;
    }
  }
}

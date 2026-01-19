import QRCode from 'qrcode';
import generatePayload from 'promptpay-qr';

export class QRService {
  /**
   * Generates a PromptPay QR Code as a Data URL (base64)
   * @param promptpayId Mobile number or Tax ID
   * @param amount Amount to pay
   */
  async generatePromptPayQR(promptpayId: string, amount: number): Promise<string> {
    try {
      const payload = generatePayload(promptpayId, { amount });
      const options: QRCode.QRCodeToDataURLOptions = {
        color: {
          dark: '#003063', // Traditional PromptPay Blue
          light: '#FFFFFF'
        },
        margin: 2
      };
      
      return await QRCode.toDataURL(payload, options);
    } catch (err) {
      console.error('QR Generation Failed:', err);
      throw new Error('Could not generate PromptPay QR code');
    }
  }
}

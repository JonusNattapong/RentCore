import { SlipVerificationService } from '../src/services/slipVerificationService';

async function main() {
  const slipVerifier = new SlipVerificationService();
  
  console.log('🔍 Testing Enhanced Slip Verification...\n');
  console.log('📁 File: E:/RentCore/test/image.png\n');
  
  const result = await slipVerifier.verify('E:/RentCore/test/image.png');
  
  console.log('='.repeat(60));
  console.log('📄 VERIFICATION RESULT');
  console.log('='.repeat(60));
  console.log(`✅ Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`💬 Message: ${result.message}`);
  
  if (result.data) {
    console.log('\n' + '='.repeat(60));
    console.log('💰 TRANSACTION DETAILS');
    console.log('='.repeat(60));
    console.log(`   Amount:      ${result.data.amount ? result.data.amount.toLocaleString() + ' THB' : 'N/A'}`);
    console.log(`   Date/Time:   ${result.data.transactionDate || 'N/A'}`);
    console.log(`   Reference:   ${result.data.transRef ? result.data.transRef.slice(0, 30) + '...' : 'N/A'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('👤 SENDER (ผู้โอน)');
    console.log('='.repeat(60));
    console.log(`   Name:        ${result.data.senderName || 'N/A'}`);
    console.log(`   Account:     ${result.data.senderAccountNo || 'N/A'}`);
    console.log(`   Bank:        ${result.data.senderBank || 'N/A'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🏦 RECEIVER (ผู้รับ)');
    console.log('='.repeat(60));
    console.log(`   Name:        ${result.data.receiverName || 'N/A'}`);
    console.log(`   Account:     ${result.data.receiverAccountNo || 'N/A'}`);
    console.log(`   Bank:        ${result.data.receiverBank || 'N/A'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('📝 RAW OCR TEXT (Debug)');
    console.log('='.repeat(60));
    console.log(result.data.ocrText);
  }
}

main().catch(console.error);

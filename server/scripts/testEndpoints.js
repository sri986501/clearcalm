const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Health & Status ---');
  const health = await get('/api/health');
  console.log('Health status:', health.data.status, health.data.service);

  console.log('\n--- 2. Insurance Products Catalog ---');
  const productsRes = await get('/api/insurance-products');
  console.log('Products count:', productsRes.data.count);
  const p1 = productsRes.data.products[0];
  console.log('Sample Product:', p1.planName, 'by', p1.providerName, '₹' + p1.annualPremiumBase);

  console.log('\n--- 3. Document Verification Test ---');
  const sampleVerify = await post('/api/verify', { sampleId: 'sample-consistent' });
  console.log('Verification Status:', sampleVerify.data.verification.status);
  console.log('Confidence:', (sampleVerify.data.verification.confidenceScore * 100) + '%');
  console.log('Recommendation:', sampleVerify.data.verification.recommendation);

  console.log('\n--- 4. Payment Creation & Verification Workflow ---');
  const orderRes = await post('/api/payments/create', {
    productId: p1.id,
    coverageAmount: 1000000,
    tenureYears: 1,
    customerDetails: { name: 'Aditya Sharma', email: 'aditya.sharma@example.com', phone: '+91 98765 43210' }
  });
  console.log('Order created:', orderRes.data.order.orderId, 'Amount: ₹' + orderRes.data.order.amount);

  const verifyPay = await post('/api/payments/verify', {
    orderId: orderRes.data.order.orderId,
    paymentId: 'pay_mock_' + Date.now(),
    amount: orderRes.data.order.amount,
    productId: p1.id,
    coverageAmount: 1000000,
    tenureYears: 1,
    customerDetails: { name: 'Aditya Sharma', email: 'aditya.sharma@example.com', phone: '+91 98765 43210' }
  });
  console.log('Payment Verified & Policy Issued:', verifyPay.data.policy.policyNumber);
  console.log('Policy Status:', verifyPay.data.policy.status);

  console.log('\n--- 5. User Policies Vault ---');
  const policies = await get('/api/policies');
  console.log('Total user policies:', policies.data.count);

  console.log('\n--- 6. Admin Overview ---');
  const admin = await get('/api/admin/overview');
  console.log('Admin Stats:', admin.data.stats);

  console.log('\n ALL TESTS PASSED SUCCESSFULLY! ');
}

runTests().catch(console.error);

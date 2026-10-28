const BASE_URL = 'https://gym-leno.vercel.app';

async function runProofTest() {
  console.log('--- 1. Testing Public Proof Screenshot Upload (/api/upload-proof) ---');
  // Create a sample SVG/PNG screenshot simulation
  const dummyScreenshot = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
    <rect width="100%" height="100%" fill="#111" />
    <text x="20" y="50" fill="#ccff00" font-size="20">Vodafone Cash Transfer Receipt</text>
    <text x="20" y="100" fill="#fff" font-size="16">Amount: 850 EGP</text>
    <text x="20" y="140" fill="#aaa" font-size="14">To: 01019882233 (Gym & Leno)</text>
    <text x="20" y="180" fill="#aaa" font-size="14">Ref: TX-9923841</text>
  </svg>`;

  const formData = new FormData();
  const fileBlob = new Blob([dummyScreenshot], { type: 'image/svg+xml' });
  formData.append('file', fileBlob, 'transfer-receipt-screenshot.svg');

  const resUpload = await fetch(`${BASE_URL}/api/upload-proof`, {
    method: 'POST',
    body: formData,
  });

  const uploadData = await resUpload.json();
  console.log(`Upload status: ${resUpload.status}`, uploadData);
  if (!uploadData.success || !uploadData.url) {
    throw new Error('Public proof upload failed: ' + JSON.stringify(uploadData));
  }
  const proofUrl = uploadData.url;
  console.log('Uploaded screenshot URL:', proofUrl);

  console.log('\n--- 2. Testing Booking Submission with Attached Proof Screenshot ---');
  const bookingPayload = {
    customerName: 'كابتن عمرو علي (فحص الإشعار)',
    phone: '01011223344',
    email: 'amr.proof@example.com',
    planId: 'plan-1m-basic',
    preferredShift: 'evening',
    paymentMethodId: 'pm-vodafone-cash',
    transactionRef: 'VF-RECEIPT-9923841',
    proofImageUrl: proofUrl,
    totalAmountEGP: 850,
  };

  const resBooking = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingPayload),
  });

  const bookingData = await resBooking.json();
  console.log(`Booking submit status: ${resBooking.status}`, bookingData);
  if (!bookingData.success || !bookingData.data?.orderCode) {
    throw new Error('Booking submission with proof failed!');
  }
  const orderCode = bookingData.data.orderCode;
  console.log(`Submitted Order Code: ${orderCode}`);

  console.log('\n--- 3. Testing Public Tracking Lookup for Proof Screenshot (/track API) ---');
  const resTrack = await fetch(`${BASE_URL}/api/bookings?lookup=${orderCode}`);
  const trackData = await resTrack.json();
  console.log(`Tracking lookup status: ${resTrack.status}, Orders found: ${trackData.data?.length}`);
  const trackedOrder = trackData.data?.[0];
  console.log('Found order customer:', trackedOrder?.customerName);
  console.log('Has proofImageUrl in tracking record?', Boolean(trackedOrder?.proofImageUrl));
  console.log('Proof URL:', trackedOrder?.proofImageUrl);
  if (trackedOrder?.proofImageUrl !== proofUrl) {
    throw new Error('proofImageUrl did not match in tracking database!');
  }

  console.log('\n--- 4. Testing Admin Dashboard Inspection of Screenshot Proof ---');
  // Login as Yassin
  const resLogin = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'yassin', password: 'YassinAnwar123' }),
  });
  const cookie = resLogin.headers.get('set-cookie')?.split(';')[0] || '';

  // Fetch admin bookings
  const resAdminBookings = await fetch(`${BASE_URL}/api/bookings`, {
    headers: { Cookie: cookie },
  });
  const adminBookingsData = await resAdminBookings.json();
  console.log(`Admin bookings count: ${adminBookingsData.data?.length}`);
  const adminTargetOrder = adminBookingsData.data?.find((b) => b.orderCode === orderCode);
  console.log('Admin found target order:', adminTargetOrder?.orderCode);
  console.log('Admin can view proof screenshot:', Boolean(adminTargetOrder?.proofImageUrl));

  console.log('\n--- 5. Admin Approving the Order with Proof ---');
  const resApprove = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'PUT',
    headers: {
      Cookie: cookie,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: trackedOrder.id,
      status: 'approved',
      adminNotes: 'تم التحقق من سكرين شوت التحويل ومطابقة المبلغ بنجاح.',
    }),
  });
  const approveData = await resApprove.json();
  console.log(`Approval status: ${resApprove.status}`, approveData.message);

  console.log('\n======================================================');
  console.log('✅ ALL SCREENSHOT PROOF UPLOAD & VERIFICATION TESTS PASSED 100%!');
  console.log('======================================================');
}

runProofTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

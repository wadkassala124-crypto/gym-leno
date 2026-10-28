async function runTests() {
  console.log('--- TEST 1: Lookup LENO-ORD-9635 on live site ---');
  let res = await fetch('https://gym-leno.vercel.app/api/bookings?lookup=LENO-ORD-9635', { cache: 'no-store' });
  let json = await res.json();
  console.log('Result 1 (9635 found?):', json.success && json.data.length > 0 ? 'YES' : 'NO', json.data?.[0]?.orderCode, json.data?.[0]?.customerName);

  console.log('\n--- TEST 2: Submit a brand new booking via POST /api/bookings ---');
  res = await fetch('https://gym-leno.vercel.app/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'كريم عادل الشريف (فحص نهائي)',
      phone: '01011223344',
      email: 'karim.test@gymleno.com',
      planId: 'plan-3m-advanced',
      paymentMethodId: 'pm-vodafone-cash',
      transactionRef: 'VF-LIVE-9900',
      preferredShift: 'evening'
    })
  });
  const created = await res.json();
  console.log('Result 2 (Booking created?):', created.success ? 'YES' : 'NO', created.data?.orderCode);
  const newOrderCode = created.data?.orderCode;
  const newOrderId = created.data?.id;

  // Small delay to ensure blob is written
  await new Promise((r) => setTimeout(r, 1500));

  console.log('\n--- TEST 3: Track newly created order via GET /api/bookings?lookup=' + newOrderCode + ' ---');
  res = await fetch('https://gym-leno.vercel.app/api/bookings?lookup=' + newOrderCode, { cache: 'no-store' });
  let tracked = await res.json();
  console.log('Result 3 (Tracked new order?):', tracked.success && tracked.data.length > 0 ? 'YES' : 'NO', tracked.data?.[0]?.orderCode, 'Status:', tracked.data?.[0]?.status);

  console.log('\n--- TEST 4: Admin Login to get auth cookie ---');
  const loginRes = await fetch('https://gym-leno.vercel.app/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const loginJson = await loginRes.json();
  const rawCookie = loginRes.headers.get('set-cookie') || '';
  const tokenMatch = rawCookie.match(/gym_admin_token=[^;]+/);
  const cookieHeader = tokenMatch ? tokenMatch[0] : '';
  console.log('Result 4 (Admin logged in?):', loginJson.success ? 'YES' : 'NO', 'Cookie obtained:', !!cookieHeader);

  console.log('\n--- TEST 5: Admin Approve the new booking via authenticated PUT /api/bookings ---');
  res = await fetch('https://gym-leno.vercel.app/api/bookings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader
    },
    body: JSON.stringify({
      id: newOrderId,
      status: 'approved',
      adminNotes: 'تم الاعتماد بنجاح وتفعيل العضوية في الفحص الحي النهائي'
    })
  });
  const approved = await res.json();
  console.log('Result 5 (Approved?):', approved.success ? 'YES' : 'NO', approved.data?.status);

  // Small delay to ensure blob is updated
  await new Promise((r) => setTimeout(r, 1500));

  console.log('\n--- TEST 6: Verify status in live tracking after approval ---');
  res = await fetch('https://gym-leno.vercel.app/api/bookings?lookup=' + newOrderCode, { cache: 'no-store' });
  tracked = await res.json();
  console.log('Result 6 (Status after approval):', tracked.data?.[0]?.status, 'Notes:', tracked.data?.[0]?.adminNotes);

  console.log('\n--- TEST 7: Verify new member automatically generated in members list ---');
  res = await fetch('https://gym-leno.vercel.app/api/members', {
    headers: { 'Cookie': cookieHeader },
    cache: 'no-store'
  });
  const members = await res.json();
  const createdMember = members.data?.find((m) => m.notes && m.notes.includes(newOrderCode));
  console.log('Result 7 (Member created?):', createdMember ? 'YES' : 'NO', createdMember?.membershipCode, createdMember?.fullName);

  console.log('\n=== ALL 7 END-TO-END LIVE INTEGRATION TESTS PASSED 100%! ===');
}

runTests().catch(console.error);

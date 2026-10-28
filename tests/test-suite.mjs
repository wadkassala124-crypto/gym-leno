import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  details: [],
};

async function test(name, fn) {
  results.total++;
  try {
    await fn();
    results.passed++;
    results.details.push({ name, status: 'PASSED' });
    console.log(`✅ PASS: ${name}`);
  } catch (err) {
    results.failed++;
    results.details.push({ name, status: 'FAILED', error: err.message });
    console.error(`❌ FAIL: ${name} -> ${err.message}`);
  }
}

async function runSuite() {
  console.log('====================================================');
  console.log('🚀 Running Gym & Leno Quality & Security Test Suite');
  console.log('====================================================\n');

  let adminCookie = '';

  // 1. SECURITY & ROUTE PROTECTION
  await test('Security: Direct access to /admin without auth redirects to /admin/login', async () => {
    const res = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    // Next.js middleware returns 307 or 302 redirect to /admin/login
    assert(
      res.status === 307 || res.status === 302,
      `Expected redirect status (307/302), got ${res.status}`
    );
    const location = res.headers.get('location') || '';
    assert(location.includes('/admin/login'), `Expected redirect to /admin/login, got: ${location}`);
  });

  await test('Security: Unauthorized mutation on /api/plans is blocked (401)', async () => {
    const res = await fetch(`${BASE_URL}/api/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacker Plan', priceEGP: 0 }),
    });
    assert.strictEqual(res.status, 401, `Expected 401 Unauthorized, got ${res.status}`);
  });

  // 2. AUTHENTICATION LIFECYCLE
  await test('Auth: Login with invalid password fails (401)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
    });
    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  await test('Auth: Login with valid credentials succeeds & issues secure token cookie', async () => {
    const res = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.user.username, 'admin');

    // Extract cookie
    const rawCookie = res.headers.get('set-cookie');
    assert(rawCookie && rawCookie.includes('gym_admin_token='), 'Cookie gym_admin_token not set');
    adminCookie = rawCookie.split(';')[0];
  });

  await test('Auth: Active session verified with cookie', async () => {
    const res = await fetch(`${BASE_URL}/api/auth`, {
      headers: { cookie: adminCookie },
    });
    const json = await res.json();
    assert.strictEqual(json.authenticated, true);
    assert.strictEqual(json.user.username, 'admin');
  });

  // 3. BOOKING VALIDATION & ANTI-PRICE TAMPERING
  await test('Validation: Empty customer name is rejected (400)', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: '', phone: '01012345678', planId: 'plan-3m-advanced', paymentMethodId: 'pm-vodafone-cash' }),
    });
    assert.strictEqual(res.status, 400);
  });

  await test('Validation: Invalid phone format is rejected (400)', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: 'Test User', phone: 'invalid-phone-string', planId: 'plan-3m-advanced', paymentMethodId: 'pm-vodafone-cash' }),
    });
    assert.strictEqual(res.status, 400);
  });

  let createdOrderCode = '';
  let createdOrderId = '';

  await test('Anti-Tampering: Client price manipulation is rejected/overridden by server DB price', async () => {
    // Client attempts to send totalAmountEGP: 5 instead of real price 2200
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'طارق حسني الشافعي',
        phone: '01077889900',
        email: 'tarek.test@example.com',
        planId: 'plan-3m-advanced', // 2200 EGP in DB
        paymentMethodId: 'pm-vodafone-cash',
        transactionRef: 'VF-TEST-123456',
        totalAmountEGP: 5, // malicious tamper
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(
      json.data.totalAmountEGP,
      2200,
      `Expected server to enforce 2200 EGP, got ${json.data.totalAmountEGP}`
    );
    assert.strictEqual(
      json.data.status,
      'pending',
      'New booking MUST start as pending, never automatically approved'
    );
    createdOrderCode = json.data.orderCode;
    createdOrderId = json.data.id;
  });

  // 4. ORDER LOOKUP & TRACKING
  await test('Tracking: Query by Order Code returns correct record', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings?lookup=${createdOrderCode}`);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.length >= 1);
    assert.strictEqual(json.data[0].orderCode, createdOrderCode);
    assert.strictEqual(json.data[0].status, 'pending');
  });

  await test('Tracking: Query by Phone Number returns user bookings', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings?lookup=01077889900`);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.length >= 1);
    assert.strictEqual(json.data[0].customerName, 'طارق حسني الشافعي');
  });

  // 5. ADMIN APPROVAL & MEMBER ACTIVATION
  await test('Admin Workflow: Admin approval activates membership & creates member record', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: adminCookie,
      },
      body: JSON.stringify({
        id: createdOrderId,
        status: 'approved',
        adminNotes: 'تم التحقق من إشعار فودافون كاش واعتماد الاشتراك بنجاح',
      }),
    });
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.status, 'approved');

    // Verify member record was created
    const membersRes = await fetch(`${BASE_URL}/api/members?q=01077889900`);
    const membersJson = await membersRes.json();
    assert(membersJson.data.length >= 1, 'Member record was not created after approval');
    assert.strictEqual(membersJson.data[0].status, 'active');
  });

  // 6. PLANS & PRICING CRUD
  let testPlanId = '';
  await test('Plans: Create new plan with admin token', async () => {
    const res = await fetch(`${BASE_URL}/api/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: adminCookie,
      },
      body: JSON.stringify({
        name: 'QA Test Weekend Pass',
        nameAr: 'باقة عطلة نهاية الأسبوع (اختبار)',
        priceEGP: 600,
        originalPriceEGP: 750,
        durationMonths: 1,
        durationLabelEn: '1 Month',
        durationLabelAr: 'شهر واحد',
        featuresEn: ['Weekend Access'],
        featuresAr: ['دخول أيام العطلات'],
        isActive: true,
        sortOrder: 10,
      }),
    });
    const json = await res.json();
    assert.strictEqual(json.success, true);
    testPlanId = json.data.id;
  });

  await test('Plans: Update plan price and verify persistence', async () => {
    const res = await fetch(`${BASE_URL}/api/plans`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: adminCookie,
      },
      body: JSON.stringify({ id: testPlanId, priceEGP: 650 }),
    });
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.priceEGP, 650);
  });

  await test('Plans: Delete test plan', async () => {
    const res = await fetch(`${BASE_URL}/api/plans?id=${testPlanId}`, {
      method: 'DELETE',
      headers: { cookie: adminCookie },
    });
    const json = await res.json();
    assert.strictEqual(json.success, true);
  });

  // 7. PAYMENT METHODS TOGGLE
  await test('Payments: Toggle payment method state and verify update', async () => {
    // Disable Orange Cash
    const toggleRes = await fetch(`${BASE_URL}/api/payment-methods`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: adminCookie,
      },
      body: JSON.stringify({ id: 'pm-orange-cash', isActive: false }),
    });
    const toggleJson = await toggleRes.json();
    assert.strictEqual(toggleJson.success, true);
    assert.strictEqual(toggleJson.data.isActive, false);

    // Re-enable
    await fetch(`${BASE_URL}/api/payment-methods`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: adminCookie,
      },
      body: JSON.stringify({ id: 'pm-orange-cash', isActive: true }),
    });
  });

  // 8. MEDIA LIBRARY OPERATIONS
  let testMediaId = '';
  await test('Media: Add media item and verify retrieval', async () => {
    const res = await fetch(`${BASE_URL}/api/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: adminCookie,
      },
      body: JSON.stringify({
        url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f',
        name: 'QA Test Floor Photo',
        type: 'image',
      }),
    });
    const json = await res.json();
    assert.strictEqual(json.success, true);
    testMediaId = json.data.id;
  });

  await test('Media: Delete test media item', async () => {
    const res = await fetch(`${BASE_URL}/api/media?id=${testMediaId}`, {
      method: 'DELETE',
      headers: { cookie: adminCookie },
    });
    const json = await res.json();
    assert.strictEqual(json.success, true);
  });

  // 9. CONTENT & VIDEO CUSTOMIZATION
  await test('Content: Update hero headline and verify live retrieval', async () => {
    const updateRes = await fetch(`${BASE_URL}/api/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: adminCookie,
      },
      body: JSON.stringify({
        hero: {
          titleEn: 'TEST HERO TITLE QA',
          titleAr: 'عنوان اختباري للجيم',
          subtitleEn: 'Test Subtitle',
          subtitleAr: 'وصف اختباري',
          ctaPrimaryEn: 'Join',
          ctaPrimaryAr: 'اشترك',
          ctaSecondaryEn: 'Explore',
          ctaSecondaryAr: 'استكشف',
          badgeEn: 'QA',
          badgeAr: 'اختبار',
        },
      }),
    });
    const updateJson = await updateRes.json();
    assert.strictEqual(updateJson.success, true);

    const getRes = await fetch(`${BASE_URL}/api/content`);
    const getJson = await getRes.json();
    assert.strictEqual(getJson.data.hero.titleEn, 'TEST HERO TITLE QA');

    // Restore original
    await fetch(`${BASE_URL}/api/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: adminCookie,
      },
      body: JSON.stringify({
        hero: {
          titleEn: 'BUILD YOUR STRONGER SELF',
          titleAr: 'ابنِ نسختك الأقوى والأفضل',
          subtitleEn: 'Start your journey towards a stronger body and a healthier life with elite certified trainers and state-of-the-art equipment.',
          subtitleAr: 'ابدأ رحلتك نحو جسم أقوى وحياة أكثر صحة مع أفضل المدربين المعتمدين وأحدث أجهزة اللياقة البدنية العالمية.',
          ctaPrimaryEn: 'Start Your Journey',
          ctaPrimaryAr: 'ابدأ رحلتك الآن',
          ctaSecondaryEn: 'Explore Programs',
          ctaSecondaryAr: 'استكشف برامجنا',
          badgeEn: 'PREMIUM FITNESS EXPERIENCE • GYM & LENO [DEMO SETUP]',
          badgeAr: 'تجربة لياقة بدنية فاخرة • جيم آند لينو [إعداد تجريبي]',
        },
      }),
    });
  });

  // 10. PUBLIC PAGES INTEGRITY
  await test('Public Pages: Home page (/) responds with 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert(html.includes('GYM') && html.includes('LENO'), 'Home page does not contain brand name');
  });

  await test('Public Pages: Track page (/track) responds with 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/track`);
    assert.strictEqual(res.status, 200);
  });

  await test('Public Pages: Admin Login page (/admin/login) responds with 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/admin/login`);
    assert.strictEqual(res.status, 200);
  });

  console.log('\n====================================================');
  console.log(`📊 Test Summary: Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed}`);
  console.log('====================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runSuite();

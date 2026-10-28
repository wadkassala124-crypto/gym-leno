const BASE_URL = 'https://gym-leno.vercel.app';

async function runTests() {
  console.log('=== TEST 1: Old Password admin123 MUST BE REJECTED ===');
  const resOld = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const dataOld = await resOld.json();
  console.log(`Status: ${resOld.status} (Expected: 401)`, dataOld);
  if (resOld.status !== 401) throw new Error('Security failure: Old password was accepted!');

  console.log('\n=== TEST 2: New Password YassinAnwar123 with username "admin" ===');
  const resAdmin = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'YassinAnwar123' })
  });
  const dataAdmin = await resAdmin.json();
  console.log(`Status: ${resAdmin.status} (Expected: 200)`, dataAdmin);
  if (resAdmin.status !== 200) throw new Error('Failed to login with admin & YassinAnwar123');

  console.log('\n=== TEST 3: New Password YassinAnwar123 with username "yassin" ===');
  const resYassin = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'yassin', password: 'YassinAnwar123' })
  });
  const dataYassin = await resYassin.json();
  const setCookie = resYassin.headers.get('set-cookie');
  console.log(`Status: ${resYassin.status} (Expected: 200)`, dataYassin);
  console.log('Admin Auth Cookie Set:', Boolean(setCookie));
  if (resYassin.status !== 200) throw new Error('Failed to login with yassin & YassinAnwar123');

  console.log('\n=== TEST 4: Check Public HTML for Hidden Admin Links ===');
  const resHome = await fetch(BASE_URL);
  const homeHtml = await resHome.text();
  const hasAdminPortalText = homeHtml.includes('بوابة إدارة الجيم');
  console.log('Does public page contain "بوابة إدارة الجيم"?', hasAdminPortalText ? 'YES (FAILURE)' : 'NO (SECURE)');
  if (hasAdminPortalText) throw new Error('Admin portal link found in public footer!');

  console.log('\n=== TEST 5: GET /api/auth as Anonymous Visitor ===');
  const resAnon = await fetch(`${BASE_URL}/api/auth`);
  const dataAnon = await resAnon.json();
  console.log('Anonymous /api/auth:', dataAnon);
  if (dataAnon.authenticated !== false) throw new Error('Anonymous visitor should NOT be authenticated!');

  console.log('\n=== TEST 6: GET /api/auth with Active Yassin Session ===');
  const cookieVal = setCookie?.split(';')[0];
  const resAuthMe = await fetch(`${BASE_URL}/api/auth`, {
    headers: { 'Cookie': cookieVal }
  });
  const dataAuthMe = await resAuthMe.json();
  console.log('Authenticated /api/auth:', dataAuthMe);
  if (dataAuthMe.authenticated !== true) throw new Error('Yassin session should be authenticated!');

  console.log('\n=============================================');
  console.log('✅ ALL SECURITY AND VISIBILITY TESTS PASSED 100%!');
  console.log('=============================================');
}

runTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});

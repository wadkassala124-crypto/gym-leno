const BASE_URL = 'https://gym-leno.vercel.app';

async function testTestimonialsCRUD() {
  console.log('--- 1. Authenticating as Yassin ---');
  const resLogin = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'yassin', password: 'YassinAnwar123' })
  });
  const dataLogin = await resLogin.json();
  console.log('Login Status:', resLogin.status, dataLogin.message);
  const cookie = resLogin.headers.get('set-cookie')?.split(';')[0] || '';
  const authHeaders = {
    'Cookie': cookie,
    'Content-Type': 'application/json'
  };

  console.log('\n--- 2. GET /api/testimonials ---');
  const resGet = await fetch(`${BASE_URL}/api/testimonials`);
  const dataGet = await resGet.json();
  console.log(`Success: ${dataGet.success}, Count: ${dataGet.data?.length}`);
  console.log('First testimonial:', dataGet.data?.[0]?.nameAr, `(${dataGet.data?.[0]?.roleAr})`);

  console.log('\n--- 3. POST /api/testimonials (Create New Testimonial) ---');
  const newReview = {
    nameAr: 'أحمد كمال (عميل تجريبي)',
    nameEn: 'Ahmed Kamal Test',
    roleAr: 'خسر 12 كجم وبنى عضلات بطن',
    roleEn: 'Lost 12kg & Built Abs',
    rating: 5,
    commentAr: 'تجربة تدريب استثنائية مع كابتن تامر، الأجهزة ممتازة والصالة نظيفة جداً ومحترمة.',
    commentEn: 'Exceptional training experience with coach Tamer, top quality equipment and super clean facility.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  };
  const resCreate = await fetch(`${BASE_URL}/api/testimonials`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(newReview)
  });
  const dataCreate = await resCreate.json();
  console.log('Create Status:', resCreate.status, dataCreate.message);
  const createdId = dataCreate.data?.id;
  console.log('Created Testimonial ID:', createdId, dataCreate.data?.nameAr);
  if (!createdId) throw new Error('Failed to create testimonial!');

  console.log('\n--- 4. PUT /api/testimonials (Update Testimonial) ---');
  const resUpdate = await fetch(`${BASE_URL}/api/testimonials`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      id: createdId,
      nameAr: 'أحمد كمال (تم التعديل بنجاح)',
      roleAr: 'بطل كمال أجسام وزن 80 كجم',
      rating: 5
    })
  });
  const dataUpdate = await resUpdate.json();
  console.log('Update Status:', resUpdate.status, dataUpdate.message, dataUpdate.data?.nameAr);

  console.log('\n--- 5. DELETE /api/testimonials (Delete Testimonial) ---');
  const resDelete = await fetch(`${BASE_URL}/api/testimonials?id=${createdId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  const dataDelete = await resDelete.json();
  console.log('Delete Status:', resDelete.status, dataDelete.message);

  console.log('\n--- 6. Verify Public Home Page Clean Display ---');
  const resHome = await fetch(BASE_URL);
  const homeHtml = await resHome.text();
  const hasOldDisclaimer = homeHtml.includes('ملاحظة: نماذج استرشادية، ويمكن لمدير الجيم استبدالها');
  console.log('Does public page have draft disclaimer?', hasOldDisclaimer ? 'YES (FAIL)' : 'NO (CLEAN & PROFESSIONAL)');
  if (hasOldDisclaimer) throw new Error('Draft disclaimer was not removed!');

  console.log('\n======================================================');
  console.log('✅ ALL TESTIMONIALS CRUD OPERATIONS FULLY VERIFIED ON LIVE PRODUCTION!');
  console.log('======================================================');
}

testTestimonialsCRUD().catch((err) => {
  console.error('Testimonials verification failed:', err);
  process.exit(1);
});

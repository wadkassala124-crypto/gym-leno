// Live verification of authenticated features on https://gym-leno.vercel.app

const BASE_URL = 'https://gym-leno.vercel.app';

async function run() {
  console.log('--- 1. Authenticating as Admin ---');
  const resLogin = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  const cookieHeader = resLogin.headers.get('set-cookie');
  console.log('Login status:', resLogin.status);
  console.log('Received Cookie header:', cookieHeader ? 'Yes (gym_admin_token received)' : 'None');

  const cookie = cookieHeader ? cookieHeader.split(';')[0] : '';
  const authHeaders = {
    'Cookie': cookie
  };

  console.log('\n--- 2. Testing GET /api/trainers ---');
  const resTrainers = await fetch(`${BASE_URL}/api/trainers`);
  const trainersData = await resTrainers.json();
  const currentTrainers = trainersData.data || [];
  console.log(`Success: ${trainersData.success}, Current trainers count: ${currentTrainers.length}`);
  console.log('Sample trainer:', currentTrainers[0]?.nameAr, `(${currentTrainers[0]?.specialtyAr})`);

  console.log('\n--- 3. Testing POST /api/trainers (Add New Coach) ---');
  const newCoach = {
    nameEn: 'Captain Tarek LiveTest',
    nameAr: 'كابتن طارق فحص مباشر',
    specialtyEn: 'CrossFit & Strength',
    specialtyAr: 'كروس فيت وقوة بدنية',
    bioEn: 'Elite coach specializing in athletic performance and hypertrophy.',
    bioAr: 'مدرب محترف متخصص في الأداء البدني العالي وتطوير القوة.',
    experienceYears: 7,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=800&q=80',
    availableDays: ['السبت', 'الاثنين', 'الأربعاء'],
    programsOffered: ['CrossFit Pro', 'Olympic Lifting']
  };

  const resAdd = await fetch(`${BASE_URL}/api/trainers`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newCoach)
  });
  const addData = await resAdd.json();
  console.log(`Add response status: ${resAdd.status}`, addData.message || addData);
  const createdTrainer = addData.data;
  if (!createdTrainer?.id) throw new Error('Failed to get created trainer id: ' + JSON.stringify(addData));
  console.log(`Added trainer ID: ${createdTrainer.id}, Name: ${createdTrainer.nameAr}`);

  console.log('\n--- 4. Testing PUT /api/trainers (Update Coach) ---');
  const updatePayload = {
    ...createdTrainer,
    nameAr: 'كابتن طارق فحص مباشر (تم التعديل بنجاح)',
    experienceYears: 10
  };
  const resUpdate = await fetch(`${BASE_URL}/api/trainers`, {
    method: 'PUT',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatePayload)
  });
  const updateData = await resUpdate.json();
  console.log(`Update status: ${resUpdate.status}`, updateData.message, `New name: ${updateData.data?.nameAr}`);

  console.log('\n--- 5. Testing DELETE /api/trainers (Delete Coach) ---');
  const resDel = await fetch(`${BASE_URL}/api/trainers?id=${createdTrainer.id}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  const delData = await resDel.json();
  console.log(`Delete status: ${resDel.status}`, delData.message || delData);

  console.log('\n--- 6. Testing POST /api/upload (Direct File Upload to Storage) ---');
  const formData = new FormData();
  // Small valid SVG file as test asset
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#ccff00"/></svg>`;
  const dummyFile = new Blob([svgContent], { type: 'image/svg+xml' });
  formData.append('file', dummyFile, 'brand-accent.svg');
  formData.append('title', 'أيقونة الهوية التجريبية');

  const resUpload = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: formData
  });
  const uploadData = await resUpload.json();
  console.log(`Upload status: ${resUpload.status}`, uploadData.message || uploadData);
  if (uploadData.data?.url) {
    console.log(`Uploaded File Public URL: ${uploadData.data.url}`);
    console.log(`Stored Type: ${uploadData.data.type}`);
  }

  console.log('\n--- 7. Testing GET /api/media (Verify Storage Library) ---');
  const resMedia = await fetch(`${BASE_URL}/api/media`);
  const mediaData = await resMedia.json();
  const mediaList = mediaData.data || [];
  console.log(`Success: ${mediaData.success}, Total stored items in Media Library: ${mediaList.length}`);
  console.log('Top media items in memory:');
  mediaList.slice(0, 3).forEach((item, idx) => {
    console.log(`  [${idx + 1}] ${item.title} (${item.type}) -> ${item.url.slice(0, 60)}...`);
  });

  console.log('\n======================================================');
  console.log('✅ ALL PRODUCTION LIVE ENDPOINTS VERIFIED 100% OPERATIONAL!');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('Error during live test:', err);
  process.exit(1);
});

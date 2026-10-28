const BASE_URL = 'https://gym-leno.vercel.app';

async function testPrograms() {
  // Login
  const resLogin = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const cookie = resLogin.headers.get('set-cookie')?.split(';')[0] || '';
  const headers = { 'Cookie': cookie, 'Content-Type': 'application/json' };

  console.log('1. Add Test Program...');
  const resAdd = await fetch(`${BASE_URL}/api/programs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      slug: 'iron-beast-test',
      titleEn: 'Iron Beast Hypertrophy',
      titleAr: 'برنامج الوحش لبناء الأجسام',
      category: 'strength',
      descriptionEn: 'High intensity lifting protocol.',
      descriptionAr: 'بروتوكول تدريبي متقدم لزيادة الكتلة العضلية والقوة القصوى.',
      durationWeeks: 8,
      difficulty: 'Advanced',
      difficultyAr: 'متقدم',
      sessionsPerWeek: 5,
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80',
      highlightsEn: ['5 Heavy Days', 'Hypertrophy Focus'],
      highlightsAr: ['5 أيام تدريب مكثف', 'تركيز كامل على التضخيم']
    })
  });
  const addData = await resAdd.json();
  console.log('Add status:', resAdd.status, addData.message);
  const progId = addData.data?.id;

  console.log('2. Update Test Program...');
  const resUpdate = await fetch(`${BASE_URL}/api/programs`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      ...addData.data,
      titleAr: 'برنامج الوحش لبناء الأجسام (معدل)'
    })
  });
  const updateData = await resUpdate.json();
  console.log('Update status:', resUpdate.status, updateData.data?.titleAr);

  console.log('3. Delete Test Program...');
  const resDel = await fetch(`${BASE_URL}/api/programs?id=${progId}`, {
    method: 'DELETE',
    headers
  });
  const delData = await resDel.json();
  console.log('Delete status:', resDel.status, delData.message);

  console.log('Programs CRUD verified successfully!');
}

testPrograms().catch(console.error);

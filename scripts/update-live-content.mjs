const BASE_URL = 'https://gym-leno.vercel.app';

async function updateLiveContent() {
  console.log('1. Logging in as Yassin...');
  const resLogin = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'yassin', password: 'YassinAnwar123' })
  });
  const cookie = resLogin.headers.get('set-cookie')?.split(';')[0] || '';
  if (!cookie) throw new Error('Failed to get auth cookie');

  console.log('2. Fetching current live content...');
  const resContent = await fetch(`${BASE_URL}/api/content`);
  const contentData = await resContent.json();
  const currentContent = contentData.data;

  // Clean announcement and badges
  const updatedContent = {
    ...currentContent,
    hero: {
      ...currentContent.hero,
      badgeEn: 'PREMIUM FITNESS EXPERIENCE • GYM & LENO',
      badgeAr: 'تجربة لياقة بدنية فاخرة • جيم آند لينو',
    },
    about: {
      ...currentContent.about,
      descriptionEn: 'Gym & Leno is an athletic sanctuary designed for transformation. Powered by Olympic-standard equipment, personalized coaching, and dedicated elite support.',
      descriptionAr: 'جيم آند لينو صالة رياضية متكاملة مصممة لتحقيق أفضل النتائج البدنية، تجمع بين أحدث الأجهزة الرياضية والتدريب الاحترافي المتخصص.',
    },
    announcement: {
      enabled: false,
      textEn: '',
      textAr: '',
      linkUrl: '#pricing',
    }
  };

  console.log('3. Saving updated content to live database...');
  const resSave = await fetch(`${BASE_URL}/api/content`, {
    method: 'POST',
    headers: {
      'Cookie': cookie,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedContent),
  });

  const saveData = await resSave.json();
  console.log('Save response status:', resSave.status, saveData.message || saveData);

  console.log('4. Verifying live content after update...');
  const resVerify = await fetch(`${BASE_URL}/api/content?t=${Date.now()}`);
  const verifyData = await resVerify.json();
  console.log('Live Announcement enabled:', verifyData.data.announcement?.enabled);
  console.log('Live Announcement textAr:', verifyData.data.announcement?.textAr);

  console.log('Successfully updated live content and removed the banner!');
}

updateLiveContent().catch(console.error);

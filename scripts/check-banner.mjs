async function check() {
  const r = await fetch('https://gym-leno.vercel.app?t=' + Date.now());
  const html = await r.text();
  console.log('Contains "باقات وعروض":', html.includes('باقات وعروض'));
  console.log('Contains "يمكن لمدير الموقع":', html.includes('يمكن لمدير الموقع'));
  console.log('Contains "[DEMO SETUP]":', html.includes('DEMO SETUP'));
}
check().catch(console.error);

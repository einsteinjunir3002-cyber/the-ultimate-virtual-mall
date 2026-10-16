async function test() {
  const ids = ['1556881286-fc6915169721', '1517256064527-09c73fc73e38', '1583454110551-21f2fa2afe61', '1574680096145-d05b474e2155'];
  for (const id of ids) {
    try {
      const res = await fetch(`https://unsplash.com/photos/${id}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const text = await res.text();
      const titleMatch = text.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'no title';
      const descMatch = text.match(/<meta\s+(?:property="og:description"|name="description")\s+content="([^"]+)"/i);
      const desc = descMatch ? descMatch[1] : 'no desc';
      console.log(id, '--> Title:', title);
      console.log('   Desc:', desc);
    } catch (e) {
      console.error(id, 'Error:', e.message);
    }
  }
}
test();

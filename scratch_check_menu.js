const url = "https://erwvzmcnwyoexbmgtlqw.supabase.co/rest/v1/menu_items?select=*";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyd3Z6bWNud3lvZXhibWd0bHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MTg1NjEsImV4cCI6MjA5ODM5NDU2MX0.3clqsfbBF-z-2_nFEHNdvwa0O98_DPXXVlWt1wJmOTs";

fetch(url, {
  headers: {
    "apikey": key,
    "Authorization": `Bearer ${key}`
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));

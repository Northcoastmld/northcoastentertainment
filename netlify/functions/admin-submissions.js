exports.handler = async (event) => {
  const allowed = process.env.ADMIN_PASSWORD;
  const supplied = event.headers?.['x-admin-password'] || event.headers?.['X-Admin-Password'];
  if (!allowed || supplied !== allowed) return { statusCode: 401, headers: {'Content-Type':'application/json'}, body: JSON.stringify({error:'Unauthorized'}) };
  const siteId = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!siteId || !token) return { statusCode: 500, headers: {'Content-Type':'application/json'}, body: JSON.stringify({error:'Admin integration is not configured yet.'}) };
  const url = 'https://api.netlify.com/api/v1/sites/'+encodeURIComponent(siteId)+'/submissions?per_page=100';
  const response = await fetch(url,{headers:{Authorization:'Bearer '+token,Accept:'application/json'}});
  if(!response.ok) return {statusCode:response.status,headers:{'Content-Type':'application/json'},body:JSON.stringify({error:'Netlify submissions could not be loaded.'})};
  const submissions = await response.json();
  return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({submissions})};
};
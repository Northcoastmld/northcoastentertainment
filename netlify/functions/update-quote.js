import { getStore } from "@netlify/blobs";

export default async (event) => {
  const allowed = process.env.ADMIN_PASSWORD;
  const supplied = event.headers?.["x-admin-password"] || event.headers?.["X-Admin-Password"];
  if (!allowed || supplied !== allowed) return { statusCode:401, headers:{"Content-Type":"application/json"}, body:JSON.stringify({error:"Unauthorized"}) };
  if (event.httpMethod !== "POST") return {statusCode:405,headers:{"Allow":"POST","Content-Type":"application/json"},body:JSON.stringify({error:"Method not allowed"})};

  let payload;
  try { payload = JSON.parse(event.body || "{}"); } catch { return {statusCode:400,headers:{"Content-Type":"application/json"},body:JSON.stringify({error:"Invalid JSON"})}; }

  const id=String(payload.id||"").trim();
  const status=String(payload.status||"").trim();
  const allowedStatuses=["NEW","CONTACTED","QUOTED","APPROVED","COMPLETED"];
  if(!id || !allowedStatuses.includes(status)) return {statusCode:400,headers:{"Content-Type":"application/json"},body:JSON.stringify({error:"Invalid enquiry or status"})};

  const quoteAmount=String(payload.quoteAmount||"").trim().slice(0,100);
  const currency=String(payload.currency||"KES").trim().slice(0,10);
  const notes=String(payload.notes||"").trim().slice(0,5000);
  const store=getStore("northcoast-quote-management");
  const record={status,quoteAmount,currency,notes,updatedAt:new Date().toISOString()};
  await store.setJSON(id,record);
  return {statusCode:200,headers:{"Content-Type":"application/json"},body:JSON.stringify({ok:true,management:record})};
};
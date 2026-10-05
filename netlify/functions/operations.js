import { getStore } from "@netlify/blobs";

const ok=(body)=>({statusCode:200,headers:{"Content-Type":"application/json","Cache-Control":"no-store"},body:JSON.stringify(body)});
const err=(statusCode,error)=>({statusCode,headers:{"Content-Type":"application/json","Cache-Control":"no-store"},body:JSON.stringify({error})});
const auth=(event)=>{const expected=process.env.ADMIN_PASSWORD;const supplied=event.headers?.["x-admin-password"]||event.headers?.["X-Admin-Password"];return Boolean(expected&&supplied===expected);};

const stores={
 customers:"northcoast-customers",
 projects:"northcoast-projects",
 retainers:"northcoast-retainers",
 payments:"northcoast-payments",
 marketplace:"northcoast-marketplace",
 academy:"northcoast-academy",
 directory:"northcoast-directory",
 advertising:"northcoast-advertising",
 ventures:"northcoast-ventures"
};
const id=(prefix)=>prefix+"-"+Date.now().toString(36).toUpperCase();
const clean=(v,max=500)=>String(v??"").trim().slice(0,max);

export default async(event)=>{
 if(!auth(event)) return err(401,"Unauthorized");
 if(event.httpMethod!=="POST") return err(405,"Method not allowed");
 let p;try{p=JSON.parse(event.body||"{}")}catch{return err(400,"Invalid JSON")};
 const action=clean(p.action,40);
 if(action==="dashboard"){
   const counts={};
   for(const [key,name] of Object.entries(stores)){const {blobs=[]}=await getStore(name).list({limit:200});counts[key]=blobs.length;}
   const leads=(await getStore("northcoast-leads").list({limit:200})).blobs||[];
   const quotes=(await getStore("northcoast-quote-management").list({limit:200})).blobs||[];
   return ok({counts,leads:leads.length,quotes:quotes.length,generatedAt:new Date().toISOString()});
 }
 const storeName=stores[clean(p.type,40)];
 if(!storeName) return err(400,"Unknown record type");
 const store=getStore(storeName);
 if(action==="list"){
   const {blobs=[]}=await store.list({limit:200});
   const rows=await Promise.all(blobs.map(b=>store.get(b.key,{type:"json"})));
   rows.sort((a,b)=>new Date(b?.updatedAt||b?.createdAt||0)-new Date(a?.updatedAt||a?.createdAt||0));
   return ok({rows:rows.filter(Boolean)});
 }
 if(action==="create"||action==="update"){
   const record=p.record||{};
   const recordId=clean(record.id,100)||id(clean(p.type,3).toUpperCase());
   const previous=await store.get(recordId,{type:"json"})||{};
   const merged={...previous,...record,id:recordId,updatedAt:new Date().toISOString(),createdAt:previous.createdAt||new Date().toISOString()};
   await store.setJSON(recordId,merged);
   return ok({record:merged});
 }
 if(action==="delete"){
   const recordId=clean(p.id,100);if(!recordId)return err(400,"Missing id");
   await store.delete(recordId);return ok({deleted:true,id:recordId});
 }
 return err(400,"Unknown action");
};
import { getStore } from "@netlify/blobs";
export default async (event) => {
 const allowed=process.env.ADMIN_PASSWORD, supplied=event.headers?.["x-admin-password"]||event.headers?.["X-Admin-Password"];
 if(!allowed||supplied!==allowed)return{statusCode:401,body:JSON.stringify({error:"Unauthorized"})};
 if(event.httpMethod!=="POST")return{statusCode:405,body:JSON.stringify({error:"Method not allowed"})};
 let p;try{p=JSON.parse(event.body||"{}")}catch{return{statusCode:400,body:JSON.stringify({error:"Invalid JSON"})}};
 const id=String(p.id||"").trim();if(!id)return{statusCode:400,body:JSON.stringify({error:"Missing enquiry id"})};
 const store=getStore("northcoast-quote-management"), old=await store.get(id,{type:"json"})||{};
 const items=Array.isArray(p.items)?p.items.map(x=>({description:String(x.description||"").slice(0,300),quantity:Number(x.quantity)||0,rate:Number(x.rate)||0})).filter(x=>x.description):[];
 const record={...old,status:String(p.status||old.status||"QUOTED"),quoteNumber:String(p.quoteNumber||old.quoteNumber||("NCE-"+new Date().getFullYear()+"-"+id.slice(-5))),currency:String(p.currency||old.currency||"KES"),quoteAmount:String(p.quoteAmount||old.quoteAmount||""),items,notes:String(p.notes||old.notes||"").slice(0,5000),updatedAt:new Date().toISOString()};
 await store.setJSON(id,record);return{statusCode:200,headers:{"Content-Type":"application/json"},body:JSON.stringify({ok:true,management:record})};
};
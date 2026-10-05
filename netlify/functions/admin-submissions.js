import { getStore } from "@netlify/blobs";

const json=(statusCode,body)=>({statusCode,headers:{"Content-Type":"application/json","Cache-Control":"no-store"},body:JSON.stringify(body)});

export default async(event)=>{
  const allowed=process.env.ADMIN_PASSWORD;
  const supplied=event.headers?.["x-admin-password"]||event.headers?.["X-Admin-Password"];
  if(!allowed||supplied!==allowed)return json(401,{error:"Unauthorized"});
  if(event.httpMethod&&event.httpMethod!=="GET")return json(405,{error:"Method not allowed"});

  const store=getStore("northcoast-leads");
  const {blobs=[]}=await store.list({limit:100});
  const submissions=await Promise.all(blobs.map(async b=>await store.get(b.key,{type:"json"})));
  submissions.sort((a,b)=>new Date(b?.created_at||0)-new Date(a?.created_at||0));

  const quoteStore=getStore("northcoast-quote-management");
  const merged=await Promise.all(submissions.filter(Boolean).map(async s=>{
    const management=await quoteStore.get(String(s.id),{type:"json"});
    return {...s,management:management||{status:s.status||"NEW",currency:"KES",quoteNumber:"",items:[],notes:""}};
  }));
  return json(200,{submissions:merged});
};
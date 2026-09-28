const menu=document.querySelector('.menu');const nav=document.querySelector('nav');menu?.addEventListener('click',()=>nav.classList.toggle('open'));document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const form=document.getElementById('quoteForm');
const msg=document.getElementById('formMessage');
const share=document.getElementById('shareActions');
const whatsapp=document.getElementById('whatsappShare');
const email=document.getElementById('emailShare');

function buildEnquiry(form){
  const data=new FormData(form);
  return [
    'NORTHCOAST ENTERTAINMENT — PROJECT ENQUIRY',
    '',
    'Name: '+data.get('name'),
    'Phone / WhatsApp: '+data.get('phone'),
    'Email: '+data.get('email'),
    'Service: '+data.get('service'),
    'Project type: '+data.get('project_type'),
    'Timeline: '+data.get('timeline'),
    '',
    'Project details:',
    data.get('message')
  ].join('\n');
}

form?.addEventListener('submit',async e=>{
  e.preventDefault();
  msg.textContent='Sending your enquiry…';
  const enquiry=buildEnquiry(form);
  try{
    const body=new URLSearchParams(new FormData(form)).toString();
    const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
    if(!response.ok) throw new Error('Submission failed');
    msg.textContent='Thank you. Your enquiry has been submitted successfully.';
    share.hidden=false;
    const encoded=encodeURIComponent(enquiry);
    whatsapp.href='https://wa.me/254793716070?text='+encoded;
    email.href='mailto:northcoastentertainmentmld@gmail.com?subject='+encodeURIComponent('Northcoast project enquiry')+'&body='+encoded;
    form.querySelector('button[type="submit"]').disabled=true;
    setTimeout(()=>{ location.href='/contact-success.html'; },700);
  }catch(error){
    msg.textContent='The enquiry could not be submitted. Please try again or use the WhatsApp/email sharing buttons after the form is available online.';
  }
});

const params=new URLSearchParams(location.search);
const service=params.get('service');
const serviceField=document.getElementById('service');
if(service && serviceField){
  const match=[...serviceField.options].find(o=>o.textContent.toLowerCase().includes(service.toLowerCase()));
  if(match) serviceField.value=match.value;
}

const menu=document.querySelector('.menu');const nav=document.querySelector('nav');menu?.addEventListener('click',()=>nav.classList.toggle('open'));document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const form=document.getElementById('quoteForm');
const msg=document.getElementById('formMessage');

function buildEnquiry(form){
  const data=new FormData(form);
  return [
    'NORTHCOAST ENTERTAINMENT — PROJECT ENQUIRY','',
    'Name: '+data.get('name'),'Phone / WhatsApp: '+data.get('phone'),'Email: '+data.get('email'),
    'Service: '+data.get('service'),'Project details:',data.get('message')
  ].join('\n');
}

form?.addEventListener('submit',async e=>{
  e.preventDefault();
  const button=form.querySelector('button[type="submit"]');
  msg.textContent='Sending your enquiry…'; button.disabled=true;
  try{
    const data=Object.fromEntries(new FormData(form).entries());
    const response=await fetch('/.netlify/functions/lead-capture',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error||'Submission failed');
    const encoded=encodeURIComponent(buildEnquiry(form));
    const phone=String(data.phone||'').replace(/[^0-9]/g,'');
    sessionStorage.setItem('northcoast_last_enquiry',JSON.stringify({id:result.id,...data}));
    msg.textContent='Enquiry received. Choose WhatsApp or email to continue the conversation.';
    let actions=document.getElementById('shareActions');
    if(!actions){
      actions=document.createElement('div');actions.id='shareActions';actions.className='share-actions';
      actions.innerHTML='<p>Your enquiry reference: <strong>'+result.id+'</strong></p><div class="actions"><a id="whatsappShare" class="btn primary" target="_blank" rel="noopener">WhatsApp Northcoast</a><a id="emailShare" class="btn ghost dark-btn">Email Northcoast</a></div>';
      form.appendChild(actions);
    }
    document.getElementById('whatsappShare').href='https://wa.me/254793716070?text='+encoded;
    document.getElementById('emailShare').href='mailto:northcoastentertainmentmld@gmail.com?subject='+encodeURIComponent('Northcoast enquiry '+result.id)+'&body='+encoded;
    setTimeout(()=>{location.href='/contact-success.html?ref='+encodeURIComponent(result.id)},900);
  }catch(error){msg.textContent=error.message||'The enquiry could not be submitted. Please use WhatsApp or email.';button.disabled=false;}
});

const params=new URLSearchParams(location.search);
const service=params.get('service');
const serviceField=document.getElementById('service');
if(service&&serviceField){const match=[...serviceField.options].find(o=>o.textContent.toLowerCase().includes(service.toLowerCase()));if(match)serviceField.value=match.value);}

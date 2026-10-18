/* Presentation only: preserve the quantitative osmotic model. */
(()=>{
 const stage=document.querySelector('.stage-wrap'),card=stage.closest('.card');
 const help=card.parentElement.querySelector('details.help'),old=help.parentElement;card.append(help);old.remove();
 document.querySelector('.control-accordion').closest('.card').append(document.querySelector('.perm-section'));
 const eq=document.querySelector('.eq'),detail=document.createElement('details');detail.className='eq';detail.innerHTML='<summary>Fórmulas e relações</summary>';while(eq.firstChild)detail.append(eq.firstChild);eq.replaceWith(detail);
 const head=document.createElement('div');head.className='stage-head';head.innerHTML='<h2>Movimento entre compartimentos</h2><button class="btn" type="button">Ampliar</button>';stage.before(head);
 const dialog=document.createElement('dialog');dialog.id='osm-zoom';dialog.setAttribute('aria-label','Animação ampliada dos compartimentos');dialog.innerHTML='<button class="btn" type="button" autofocus>Fechar</button>';document.body.append(dialog);let anchor;
 head.querySelector('button').onclick=()=>{anchor=document.createComment('palco');stage.before(anchor);dialog.append(stage);dialog.showModal()};dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{anchor.replaceWith(stage);head.querySelector('button').focus()});
 if(innerWidth<=600)document.querySelector('.control-accordion').open=false;
})();

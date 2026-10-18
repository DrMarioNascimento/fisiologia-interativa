/* Retorno ao mesmo percurso do Tutor, sem catálogo ou laboratório externo. */
(() => {
 const root=new URL('./',document.currentScript.src);
 const curso=new URLSearchParams(location.search).get('percurso')==='fisioterapia'?'fisioterapia':'educacao-fisica';
 function aplicar(){document.querySelectorAll('[data-voltar-tutor]').forEach(a=>{
  a.href=new URL('../tutor-'+(curso==='fisioterapia'?'fisio':'ef')+'.html',root).href;
 });}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',aplicar,{once:true});else aplicar();
})();

export default function formatImg (html) {
  var newContent = html.replace(/\n/g, '<br>').replace(/<img[^>]*>/gi, (match) => {
    let processed=null;
    if(!match.match(/style=\"(.*)\"/gi)){
      processed=match.replace(/\<img/g, '<img style="width:100%;height:auto;display:block"');
    }else{
      processed = match.replace(/style=\"(.*)\"/gi, 'style="width:100%;height:auto;display:block"');
    }
    return processed;
  });
  return newContent;
} 
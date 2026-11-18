import {useEffect,useRef} from 'react';
import type {Dispatch} from 'react';
import type {ContentAction,ContentStateTypes} from '../reducers/content-reducer';
import type {WordActions} from '../reducers/words-reducer';
import type {WordTypes} from '../types/word-types';
import type {Snippet,ContentTranscriptTypes} from '../types/content-types';
import {isDueCheck} from '@/utils/is-due-check';

type Card=Record<string,unknown> & {id:string};
type Entry={breakdown?:boolean;kind:'review';key:string;origin:string;language:string;contentId:string;cardKind:'snippet'|'word'|'sentence';id:string;before:Card|null;after:Card|null};
const stable=(value:unknown):string=>JSON.stringify(value,(_key,item)=>item && typeof item==='object' && !Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
const signature=(card:Card)=>stable({reviewData:card.reviewData || null,focusedText:card.focusedText || null,isPreSnippet:card.isPreSnippet || false});
// Apply only changed fields. Other local annotations/progress remain intact.
export function patchReviewCard(current:Card,entry:Entry):Card|null|undefined {
  if(entry.breakdown && entry.cardKind==='sentence'){
    if(!entry.before || !entry.after || current.targetLang!==entry.before.targetLang ||
      current.sentenceStructure || (Array.isArray(current.vocab) && current.vocab.length))return undefined;
    const updated={...current};
    for(const field of ['vocab','sentenceStructure','meaning','transliteration','structures']){
      if(Object.hasOwn(entry.after,field) && stable(current[field])===stable(entry.before[field]))updated[field]=entry.after[field];
    }
    return updated;
  }
  if(!entry.before || signature(current)!==signature(entry.before))return undefined;
  if(entry.after===null)return null;
  const updated={...current};
  for(const key of new Set([...Object.keys(entry.before),...Object.keys(entry.after)])){
    if(key==='id' || stable(entry.before[key])===stable(entry.after[key]))continue;
    if(entry.after[key]===undefined)delete updated[key];else updated[key]=entry.after[key];
  }
  if(entry.cardKind==='word')updated.isDue=isDueCheck(updated as unknown as WordTypes,new Date());
  return updated;
}
export function useReaderReviewSync({language,ready,words,content,dispatchWords,dispatchContent}:{
 language:string;ready:boolean;words:WordTypes[];content:ContentStateTypes[];dispatchWords:Dispatch<WordActions>;dispatchContent:Dispatch<ContentAction>;
}){
 const latest=useRef({language,ready,words,content});latest.current={language,ready,words,content};
 const pending=useRef(new Map<string,Entry>()),drain=useRef(()=>{});
 drain.current=()=>{
  for(const [key,entry] of pending.current){
   const active=entry.language===latest.current.language;if(active && !latest.current.ready)continue;
   try{
    const cacheKey=`${entry.language}-${entry.cardKind==='word'?'wordsState':'contentState'}`;
    const raw=localStorage.getItem(cacheKey),cached=raw?JSON.parse(raw):null;
    if(!active && !Array.isArray(cached))continue;
    if(entry.cardKind==='word'){
     const base:WordTypes[]=active?latest.current.words:cached;
     const current=base.find(row=>row.id===entry.id);
     if(current){
      const next=patchReviewCard(current as unknown as Card,entry);
      if(next!==undefined){
       const merged=base.flatMap(row=>row.id===entry.id?(next?[next as unknown as WordTypes]:[]):[row]);
       localStorage.setItem(cacheKey,JSON.stringify(merged));
       if(active){latest.current.words=merged;if(next)dispatchWords({type:'updateWordData',wordId:entry.id,fields:next as unknown as Partial<WordTypes>});else dispatchWords({type:'removeWord',wordId:entry.id});}
      }
     }
    }else{
     const base:ContentStateTypes[]=active?latest.current.content:cached;
     const contentIndex=base.findIndex(row=>row.id===entry.contentId);
     // Wait for the initial content import/cache, rather than creating a partial record.
     if(contentIndex<0)continue;
     const owner=base[contentIndex];
     const rows=(entry.cardKind==='snippet'?(Array.isArray(owner.snippets)?owner.snippets:Object.values(owner.snippets || {})):owner.content) as Array<Snippet|ContentTranscriptTypes>;
     const current=rows.find(row=>row.id===entry.id);
     const isNewSnippet=entry.cardKind==='snippet' && entry.before===null && !current;
     const next=isNewSnippet?entry.after:current?patchReviewCard(current as unknown as Card,entry):undefined;
     if(next!==undefined){
       const updatedRows=isNewSnippet && next
        ? [...rows as unknown as Card[],next]
        : rows.flatMap<Card>(row=>row.id===entry.id?(next?[next]:[]):[row as unknown as Card]);
       const merged=base.map((row,index)=>index===contentIndex?{...row,[entry.cardKind==='snippet'?'snippets':'content']:updatedRows}:row) as ContentStateTypes[];
       localStorage.setItem(cacheKey,JSON.stringify(merged));
       if(active){latest.current.content=merged;
        if(entry.cardKind==='snippet'){
         if(next)dispatchContent({type:'saveSnippet',contentIndex,snippetData:next as unknown as Snippet,isUpdate:!isNewSnippet});else dispatchContent({type:'deleteSnippet',contentIndex,snippetId:entry.id});
        }else if(next){
         // Explicit undefined removes the review field in the existing reducer.
         dispatchContent({type:'updateSentence',contentIndex,sentenceId:entry.id,fields:{...next,reviewData:next.reviewData} as unknown as Partial<ContentTranscriptTypes>});
        }
       }
     }
    }
    // Replays and conflicts with newer local progress are acknowledged without resetting it.
    pending.current.delete(key);window.postMessage({type:'ll-reader-import-applied',key},location.origin);
   }catch{ /* Leave delivery queued when browser persistence is unavailable. */ }
  }
 };
 useEffect(()=>{
  if(!['localhost','127.0.0.1'].includes(location.hostname))return;
  const receive=(event:MessageEvent)=>{
   if(event.source!==window || event.origin!==location.origin || event.data?.type!=='ll-reader-import')return;
   const entry=event.data.entry;
   if(entry?.kind!=='review' || entry.origin!==location.origin || typeof entry.key!=='string' || !['japanese','chinese','arabic','french'].includes(entry.language) || !['snippet','word','sentence'].includes(entry.cardKind) || !/^netflix:\d{1,20}$/.test(entry.contentId) || (entry.before===null ? entry.cardKind!=='snippet' || !entry.after : entry.before?.id!==entry.id) || (entry.after!==null && entry.after?.id!==entry.id))return;
   pending.current.set(entry.key,entry);drain.current();
  };
  const retry=()=>drain.current();window.addEventListener('message',receive);window.addEventListener('focus',retry);
  window.postMessage({type:'ll-reader-ready'},location.origin);
  return ()=>{window.removeEventListener('message',receive);window.removeEventListener('focus',retry);};
 },[dispatchWords,dispatchContent]);
 useEffect(()=>{drain.current();},[language,ready,words,content]);
}

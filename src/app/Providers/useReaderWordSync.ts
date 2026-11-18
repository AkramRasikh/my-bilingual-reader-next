import {useEffect,useRef} from 'react';
import type {Dispatch} from 'react';
import type {WordActions} from '../reducers/words-reducer';
import type {WordTypes} from '../types/word-types';
import type {ContentStateTypes} from '../reducers/content-reducer';
import {isDueCheck} from '@/utils/is-due-check';

type SourceHint={sentenceId:string;title:string;time:number};
type Entry={kind:'word';key:string;origin:string;language:string;word:unknown;source?:SourceHint};
function savedWord(value:unknown,content:ContentStateTypes[],source?:SourceHint):WordTypes {
  const word=value as WordTypes;
  if(!word || typeof word.id!=='string' || !word.id || typeof word.surfaceForm!=='string' || !Array.isArray(word.contexts) || !word.contexts.every(id=>typeof id==='string'))throw new Error('Invalid saved word');
  const contextId=word.contexts[0];
  const owner=content.find(item=>item.content?.some(line=>line.id===contextId));
  const sentence=owner?.content.find(line=>line.id===contextId);
  const hint=source?.sentenceId===contextId ? source : undefined;
  // These are reader UI fields; retain the backend's canonical word/card fields.
  return {...word,originalContext:owner?.title || hint?.title || word.originalContext || '',
    time:sentence?.time ?? hint?.time ?? word.time,isDue:isDueCheck(word,new Date())};
}
function append(existing:WordTypes[],incoming:WordTypes[]):WordTypes[] {
  const result=[...existing],ids=new Set(existing.map(word=>word.id));
  for(const word of incoming)if(word?.id && !ids.has(word.id)){result.push(word);ids.add(word.id);}
  return result;
}
export function useReaderWordSync({language,ready,words,content,dispatch}:{
  language:string;ready:boolean;words:WordTypes[];content:ContentStateTypes[];dispatch:Dispatch<WordActions>;
}) {
  const latest=useRef({language,ready,words,content});latest.current={language,ready,words,content};
  const pending=useRef(new Map<string,Entry>());
  const drain=useRef(()=>{});
  drain.current=()=>{
    for(const [key,entry] of pending.current){
      const active=entry.language===latest.current.language;
      if(active && !latest.current.ready)continue;
      try{
        const cacheKey=`${entry.language}-wordsState`,raw=localStorage.getItem(cacheKey);
        const cached=raw ? JSON.parse(raw) : null;
        // Never create a partial inactive-language cache with just this word.
        if(!active && !Array.isArray(cached))continue;
        const contentRaw=active ? null : localStorage.getItem(`${entry.language}-contentState`);
        const context=active ? latest.current.content : contentRaw ? JSON.parse(contentRaw) : [];
        const incoming=savedWord(entry.word,Array.isArray(context)?context:[],entry.source);
        const base=active ? latest.current.words : cached;
        const merged=append(base,[incoming]);
        // Persist before dispatch/ack. A storage failure leaves delivery queued.
        localStorage.setItem(cacheKey,JSON.stringify(merged));
        if(active){
          const currentIds=new Set(latest.current.words.map(word=>word.id));
          latest.current.words=merged;
          for(const word of merged)if(!currentIds.has(word.id))dispatch({type:'addWord',word});
        }
        pending.current.delete(key);
        window.postMessage({type:'ll-reader-import-applied',key},location.origin);
      }catch{ /* Keep the confirmed word queued until browser storage is writable. */ }
    }
  };
  useEffect(()=>{
    if(!['localhost','127.0.0.1'].includes(location.hostname))return;
    const receive=(event:MessageEvent)=>{
      if(event.source!==window || event.origin!==location.origin)return;
      const entry=event.data?.entry;
      if(event.data?.type!=='ll-reader-import' || entry?.kind!=='word' || entry.origin!==location.origin || typeof entry.key!=='string' || !['japanese','chinese','arabic','french'].includes(entry.language))return;
      pending.current.set(entry.key,entry);drain.current();
    };
    const storage=(event:StorageEvent)=>{
      if(!latest.current.ready || event.key!==`${latest.current.language}-wordsState` || !event.newValue)return;
      try{
        const incoming=JSON.parse(event.newValue);if(!Array.isArray(incoming))return;
        const ids=new Set(latest.current.words.map(word=>word.id));
        const newWords:WordTypes[]=[];
        for(const word of incoming)if(word?.id && !ids.has(word.id)){newWords.push(word);ids.add(word.id);}
        latest.current.words=append(latest.current.words,newWords);
        for(const word of newWords)dispatch({type:'addWord',word});
      }catch{ /* Ignore malformed writes from another tab. */ }
    };
    const retry=()=>drain.current();
    window.addEventListener('message',receive);window.addEventListener('storage',storage);window.addEventListener('focus',retry);
    window.postMessage({type:'ll-reader-ready'},location.origin);
    return ()=>{window.removeEventListener('message',receive);window.removeEventListener('storage',storage);window.removeEventListener('focus',retry);};
  },[dispatch]);
  useEffect(()=>{drain.current();},[language,ready,words,content]);
}

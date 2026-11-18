/** @jest-environment jsdom */
/** @jest-environment-options {"url":"http://localhost:3000"} */
import {act,renderHook,waitFor} from '@testing-library/react';
import {useReducer} from 'react';
import {useReaderWordSync} from './useReaderWordSync';
import {wordsReducer} from '../reducers/words-reducer';
import type {WordActions} from '../reducers/words-reducer';
import type {WordTypes} from '../types/word-types';
import type {ContentStateTypes} from '../reducers/content-reducer';
const old={id:'old',surfaceForm:'既存',contexts:['older-line'],reviewData:{reps:20,due:'2030-01-01'}} as unknown as WordTypes;
const saved={id:'new-word',baseForm:'日本',surfaceForm:'日本',definition:'Japan',phonetic:'にほん',transliteration:'nihon',contexts:['line'],reviewData:{reps:1,due:'2030-01-01'}};
const content=[{id:'netflix:83028069',title:'episode-01',content:[{id:'line',time:64,targetLang:'日本語です',baseLang:'Japanese'}],snippets:[]}] as unknown as ContentStateTypes[];
function deliver(word:unknown=saved,language='japanese',origin=location.origin){
 window.dispatchEvent(new MessageEvent('message',{source:window,origin,data:{type:'ll-reader-import',entry:{kind:'word',key:'saved-word',origin,language,word}}}));
}
function mount(ready=true,language='japanese'){
 return renderHook(({ready,language})=>{
  const [words,dispatch]=useReducer((state:WordTypes[],action:WordActions)=>wordsReducer(state,action) as WordTypes[],[old]);
  useReaderWordSync({language,ready,words,content,dispatch});return words;
 },{initialProps:{ready,language}});
}
beforeEach(()=>{localStorage.clear();jest.spyOn(window,'postMessage').mockImplementation(()=>{});global.fetch=jest.fn();});
afterEach(()=>jest.restoreAllMocks());
test('word-only delivery updates React and localStorage without a content payload or any API call',async()=>{
 const sentinel=JSON.stringify(content);localStorage.setItem('japanese-contentState',sentinel);
 const hook=mount();act(()=>deliver());
 await waitFor(()=>expect(hook.result.current).toHaveLength(2));
 const item=hook.result.current[1];expect(item).toMatchObject({...saved,originalContext:'episode-01',time:64,isDue:false});
 expect(JSON.parse(localStorage.getItem('japanese-wordsState')!)).toHaveLength(2);
 expect(localStorage.getItem('japanese-contentState')).toBe(sentinel);expect(fetch).not.toHaveBeenCalled();
 expect(window.postMessage).toHaveBeenCalledWith({type:'ll-reader-import-applied',key:'saved-word'},location.origin);
});
test('replayed words never duplicate entries or reset existing review progress',async()=>{
 const hook=mount();act(()=>deliver());act(()=>deliver());
 await waitFor(()=>expect(hook.result.current).toHaveLength(2));
 act(()=>deliver({...saved,id:'old',reviewData:{reps:1,due:'2030-01-01'}}));
 expect(hook.result.current[0].reviewData.reps).toBe(20);expect(hook.result.current).toHaveLength(2);
});
test('waits until reader initialization before merging the active word list',async()=>{
 const hook=mount(false);act(()=>deliver());
 expect(localStorage.getItem('japanese-wordsState')).toBeNull();
 expect(window.postMessage).not.toHaveBeenCalledWith({type:'ll-reader-import-applied',key:'saved-word'},location.origin);
 hook.rerender({ready:true,language:'japanese'});
 await waitFor(()=>expect(hook.result.current).toHaveLength(2));
});
test('a storage failure neither changes React state nor acknowledges delivery; focus retries locally',async()=>{
 const hook=mount();const write=jest.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('full');});
 act(()=>deliver());expect(hook.result.current).toHaveLength(1);
 expect(window.postMessage).not.toHaveBeenCalledWith({type:'ll-reader-import-applied',key:'saved-word'},location.origin);
 write.mockRestore();act(()=>window.dispatchEvent(new Event('focus')));
 await waitFor(()=>expect(hook.result.current).toHaveLength(2));expect(fetch).not.toHaveBeenCalled();
});
test('another language with no cache stays queued until initialized, without altering the visible list',async()=>{
 const hook=mount(true,'chinese');act(()=>deliver());
 expect(hook.result.current).toHaveLength(1);expect(localStorage.getItem('japanese-wordsState')).toBeNull();
 hook.rerender({ready:true,language:'japanese'});await waitFor(()=>expect(hook.result.current).toHaveLength(2));
 expect(fetch).not.toHaveBeenCalled();
});
test('updates an existing inactive-language word cache without changing the active React list',()=>{
 localStorage.setItem('japanese-wordsState',JSON.stringify([old]));const hook=mount(true,'chinese');
 act(()=>deliver());expect(hook.result.current).toHaveLength(1);
 expect(JSON.parse(localStorage.getItem('japanese-wordsState')!)).toHaveLength(2);
});
test('other tabs add new word IDs once and cannot overwrite existing review cards',async()=>{
 const hook=mount();act(()=>window.dispatchEvent(new StorageEvent('storage',{key:'japanese-wordsState',newValue:JSON.stringify([{...old,reviewData:{reps:1}},saved,saved])})));
 await waitFor(()=>expect(hook.result.current).toHaveLength(2));expect(hook.result.current[0].reviewData.reps).toBe(20);
});
test('ignores untrusted origins and malformed returned words',()=>{
 const hook=mount();act(()=>deliver(saved,'japanese','https://example.com'));act(()=>deliver({id:'broken'}));
 expect(hook.result.current).toHaveLength(1);expect(localStorage.getItem('japanese-wordsState')).toBeNull();
});

/** @jest-environment jsdom */
/** @jest-environment-options {"url":"http://localhost:3000"} */
import {act,renderHook,waitFor} from '@testing-library/react';
import {useReducer} from 'react';
import {useReaderReviewSync} from './useReaderReviewSync';
import {contentReducer,type ContentStateTypes} from '../reducers/content-reducer';
import {wordsReducer,type WordActions} from '../reducers/words-reducer';
import type {WordTypes} from '../types/word-types';
const review={due:'2020-01-01',reps:2};
const next={due:'2030-01-01',reps:3};
const snippet={id:'s',time:10,targetLang:'日本語',baseLang:'Japanese',reviewData:review};
const line={id:'line',time:9,targetLang:'日本語',baseLang:'Japanese',reviewData:review};
const word={id:'w',surfaceForm:'日本',contexts:['line'],reviewData:review};
const initial=[{id:'netflix:83028069',title:'episode',content:[line],snippets:[snippet],contentIndex:0},{id:'youtube-id',title:'Other',content:[],snippets:[],contentIndex:1}] as unknown as ContentStateTypes[];
function mount(ready=true,language='japanese'){
 return renderHook(({ready,language})=>{
  const [content,dispatchContent]=useReducer(contentReducer,initial);
  const [words,dispatchWords]=useReducer((state:WordTypes[],action:WordActions)=>wordsReducer(state,action) as WordTypes[],[word] as unknown as WordTypes[]);
  useReaderReviewSync({language,ready,words,content,dispatchWords,dispatchContent});return {content,words};
 },{initialProps:{ready,language}});
}
function deliver(cardKind='snippet',before:unknown=snippet,after:unknown={...snippet,reviewData:next},language='japanese',breakdown=false){
 const value=(before ?? after) as {id:string};window.dispatchEvent(new MessageEvent('message',{source:window,origin:location.origin,data:{type:'ll-reader-import',entry:{kind:'review',key:'review-'+cardKind,origin:location.origin,language,contentId:'netflix:83028069',cardKind,id:value.id,before,after,breakdown}}}));
}
beforeEach(()=>{localStorage.clear();jest.spyOn(window,'postMessage').mockImplementation(()=>{});global.fetch=jest.fn();});
afterEach(()=>jest.restoreAllMocks());
test('confirmed snippet review patches React and localStorage without changing other content',async()=>{
 const h=mount();act(()=>deliver());await waitFor(()=>expect(h.result.current.content[0].snippets![0].reviewData).toEqual(next));
 expect(h.result.current.content[0].content[0].reviewData).toEqual(review);expect(h.result.current.content[1]).toEqual(initial[1]);
 expect(JSON.parse(localStorage.getItem('japanese-contentState')!)[0].snippets[0].reviewData).toEqual(next);expect(fetch).not.toHaveBeenCalled();
});
test('replays and stale incoming reviews cannot reset newer progress',()=>{
 const h=mount();act(()=>deliver());act(()=>deliver());act(()=>deliver('snippet',snippet,{...snippet,reviewData:{reps:1,due:'2021-01-01'}}));
 expect(h.result.current.content[0].snippets![0].reviewData).toEqual(next);
});
test('snippet deletion and sentence review removal preserve the transcript and other records',()=>{
 const h=mount();act(()=>deliver('snippet',snippet,null));expect(h.result.current.content[0].snippets).toEqual([]);
 const {reviewData:_review,...without}=line;act(()=>deliver('sentence',line,without));
 expect(h.result.current.content[0].content[0].reviewData).toBeUndefined();expect(h.result.current.content[0].content[0].targetLang).toBe(line.targetLang);
});
test('word grades update the existing word; retirement deletes only that word',()=>{
 const h=mount();act(()=>deliver('word',word,{...word,reviewData:next}));expect(h.result.current.words[0].reviewData).toEqual(next);
 act(()=>deliver('word',{...word,reviewData:next},null));expect(h.result.current.words).toEqual([]);expect(h.result.current.content).toEqual(initial);
});
test('browser storage failure keeps React unchanged until persistence can retry',()=>{
 const h=mount();const write=jest.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('full');});
 act(()=>deliver());expect(h.result.current.content).toEqual(initial);expect(window.postMessage).not.toHaveBeenCalledWith(expect.objectContaining({type:'ll-reader-import-applied'}),location.origin);
 write.mockRestore();act(()=>window.dispatchEvent(new Event('focus')));expect(h.result.current.content[0].snippets![0].reviewData).toEqual(next);
});
test('waits for initialization and never creates a partial inactive language cache',()=>{
 const h=mount(false,'chinese');act(()=>deliver());expect(localStorage.getItem('japanese-contentState')).toBeNull();
 h.rerender({ready:true,language:'japanese'});expect(h.result.current.content[0].snippets![0].reviewData).toEqual(next);
});

test('adds a confirmed new snippet once and preserves its later review progress',()=>{
 const h=mount();
 const captured={...snippet,id:'local-snippet',time:13};
 act(()=>deliver('snippet',null,captured));
 act(()=>deliver('snippet',captured,{...captured,reviewData:next}));
 act(()=>deliver('snippet',null,captured));
 expect(h.result.current.content[0].snippets).toEqual([snippet,{...captured,reviewData:next}]);
 expect(h.result.current.content[0].content).toEqual([line]);
});

test('confirmed Netflix breakdown merges annotations while preserving newer review progress',()=>{
 const h=mount();
 act(()=>deliver('sentence',line,{...line,reviewData:next}));
 act(()=>deliver('sentence',line,{...line,sentenceStructure:'noun',meaning:'Japanese'},'japanese',true));
 expect(h.result.current.content[0].content[0]).toEqual({...line,reviewData:next,sentenceStructure:'noun',meaning:'Japanese'});
});

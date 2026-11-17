This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## YouTube checkpoint extension: database import

`POST /api/importYoutubeCheckpoints` imports a transcript and saved snippets without uploading audio or video. Run this app locally and enter its origin (e.g. `http://localhost:3000`) in the extension's **Upload to Firebase** section. No import token is required. The route uses the existing Firebase Admin setup from `api/uploadYoutubeContent/firebase-admin-init.ts`.

Token-free access is restricted to localhost, 127.0.0.1, or IPv6 loopback URLs. Browser origins must be the same origin or a Chrome extension. Remote hostnames and unrelated browser origins receive 403; do not expose the local server through a public proxy. Requests must use `Content-Type: application/json`.

The JSON body contains `contentId` (the YouTube video ID, equal to `videoId`), `videoId`, `title`, `language`, `transcript`, and `snippets`. Languages are Arabic, Chinese, French, and Japanese (case insensitive). Transcript items require UUID `id`, nonnegative numeric `time`, and strings `targetLang` and `baseLang`. Snippets use the same core fields plus `isContracted`, `isPreSnippet`, and `suggestedFocusText`; optional `focusedText` is supported. Only these reader fields are accepted into the database. Bodies are limited to 8 MB.

The route atomically creates `/{language}/content/{contentId}` with transcript lines in `content`, snippets keyed by UUID, `origin: 'youtube'`, and canonical YouTube `url`. It returns 201 on success, 409 if the ID exists (no overwrite), and 400 for invalid data. It does not upload or fetch media. Refresh the reader's cached data after importing. Existing content updates and snippet syncing are not supported by this endpoint. The old `CHECKPOINT_IMPORT_TOKEN` environment variable can be removed.

Run endpoint tests without the app's DOM-only global setup:

```sh
npx jest src/app/api/importYoutubeCheckpoints/route.test.ts --runInBand --setupFilesAfterEnv
```

## Checkpoint media download and Cloudflare upload

`POST /api/checkpointMedia` accepts `{contentId, language}`, checks that the Firebase content record exists, reads its title, and starts a local background download using the existing YouTube audio/video helpers. Successful downloads automatically upload to R2 using the same S3 client and title-based reader paths: `{language}-audio/{title}.mp3` and `{language}-video/{title}.mp4`. No transcript or snippet rewrite happens. `yt-dlp`, `ffmpeg`, and the reader's existing R2 configuration must be available on the Next server. The bucket may use `CLOUD_FLARE_R2_BUCKET_NAME` or the existing `NEXT_PUBLIC_CLOUD_FLARE_R2_BUCKET_NAME`.

Poll `GET /api/checkpointMedia?jobId=...` for `downloading`, `select-formats`, `uploading`, `uploaded`, or `error`. Default download failures return available formats. Retry selection with `POST {jobId, videoFormatId, audioFormatId}`; IDs must be in the job's available options. Successful partial downloads are reused. For upload failures, start the job again with `{contentId, language}`; already uploaded files are skipped and remaining local files reused.

Media streams to R2 with explicit content length and MIME type. Each local source is deleted only after R2 confirms success. Once both files are uploaded, the temporary directory is removed. Failed uploads retain their source files. Existing R2 objects at the same title-based paths are replaced, matching the original uploader. The job records `audioKey` and `videoKey` before cleanup, so retrying a failed second upload does not download/upload the first file again.

The localhost-only job state survives hot reloads but not process restarts. Keep Next running through completion; this is not a serverless job system. Previous download-only jobs can be resumed through the start action to upload their files without downloading again while their state is still in memory.

Tests: `npx jest src/app/api/checkpointMedia src/app/api/importYoutubeCheckpoints/route.test.ts src/app/api/getYoutubeVideo --runInBand --setupFilesAfterEnv`.

The checkpoint import endpoint generates each snippet's initial `reviewData` server-side using `srsCalculationAndText({contentType: srsRetentionKeyTypes.snippet, timeNow: new Date()}).nextScheduledOptions['1'].card`, matching the frontend quick-save flow. The card is JSON-serialized so dates are stored as ISO strings, matching a frontend POST. The request does not need review data, and transcript rows receive none. This is a create-only import; existing content/review progress is not overwritten or backfilled.

Checkpoint imports also apply server-side bulk review: transcript sentences whose time intervals have at least 50% union coverage from snippets with `reviewData.due` receive the initial sentence Hard card (`getNextScheduledOptions({card: getEmptyCard(), contentType: srsRetentionKeyTypes.sentences})['2'].card`), serialized for Firebase. The server reuses `getSnippetTimeRange`; overlapping windows never double count. Sentences end at the next line's start, or optional numeric `mediaDuration` for the final line. Without known duration, the final line is skipped. This intentionally implements inclusive, exact time coverage; the existing frontend approximates via ten samples and uses >50%. The response adds `reviewedSentenceCount`. This is applied atomically with initial content creation, not as an update to existing review history.

## Extension imports and browser cache

Successful checkpoint creation returns `newContentData` with the exact record written to Firebase, including generated review cards. The extension queues it locally and delivers it through an isolated content-script bridge on its configured localhost reader origin. `useReaderImportSync` in `FetchDataProvider` receives same-window/same-origin import messages, normalizes keyed snippets to arrays, merges by content ID, writes `{language}-contentState`, and updates the active React state. Existing items/review progress are preserved on duplicate delivery. Other open tabs receive new cached items through storage events.

The extension keeps imports queued while no reader tab is open and removes them only after the page confirms successful cache persistence. Initialization must finish before merging into the active language. For a language without a cached array, the reader loads the complete content list through `/api/getOnLoadData` before creating the cache. Storage/fetch errors leave imports unacknowledged for retry on focus or reopening; Firebase success is independent of cache synchronization. Refresh reader pages once after updating to install the new hook, and reload the extension for its scripting permission.

## Manual checkpoint subtitle fallback

`POST /api/checkpointSubtitles` accepts `{videoId, language, includeEnglish}` and starts a localhost-only yt-dlp subtitle job. `GET /api/checkpointSubtitles?jobId=...` returns status/results. The extension invokes this only through an explicit popup button, never as an automatic 429 retry. It works before Firebase import and does not touch Firebase or R2.

The helper inspects uploaded/autogenerated track metadata, chooses one study-language track and optionally one English track, downloads subtitles only, and parses JSON3 or VTT into cues. Uploaded tracks are preferred. Traditional Chinese is accepted. English failures return a usable study-language result. Temporary files are removed in `finally`. Each yt-dlp operation has a 20-second timeout and automatic retries disabled. Target retrieval errors leave the extension cache unchanged; the error message distinguishes a yt-dlp 429. The local job map is bounded and does not survive process restarts. Tests: `npx jest src/app/api/checkpointSubtitles --runInBand --setupFilesAfterEnv`.

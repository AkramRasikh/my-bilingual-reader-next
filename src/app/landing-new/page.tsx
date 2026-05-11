import LandingNewContainer from '../LandingNew/LandingNewContainer';

/** Skip static prerender at build time; render on request instead. */
export const dynamic = 'force-dynamic';

export default async function LandingNewPage() {
  return <LandingNewContainer />;
}

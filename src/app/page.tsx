import { SocialSigningDemo } from '@/src/components/SocialSigningDemo'
import { readSocialEnvironment } from '@/src/config/environment'

export default function HomePage() {
  return <SocialSigningDemo environment={readSocialEnvironment()} />
}

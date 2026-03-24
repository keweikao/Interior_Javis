import { useSlideNavigation } from '@/hooks/useSlideNavigation'
import { SlideContainer } from '@/components/SlideContainer'
import { Navigation } from '@/components/Navigation'

import { Slide01Cover } from '@/slides/Slide01Cover'
import { Slide02Problem } from '@/slides/Slide02Problem'
import { Slide03Solution } from '@/slides/Slide03Solution'
import { Slide04Demo } from '@/slides/Slide04Demo'
import { Slide05VPC } from '@/slides/Slide05VPC'
import { Slide06Market } from '@/slides/Slide06Market'
import { Slide07POCD } from '@/slides/Slide07POCD'
import { Slide08Competition } from '@/slides/Slide08Competition'
import { Slide09LeanCanvas } from '@/slides/Slide09LeanCanvas'
import { Slide10Team } from '@/slides/Slide10Team'
import { Slide11Validation } from '@/slides/Slide11Validation'
import { Slide12Ask } from '@/slides/Slide12Ask'

const slides = [
  Slide01Cover,
  Slide02Problem,
  Slide03Solution,
  Slide04Demo,
  Slide05VPC,
  Slide06Market,
  Slide07POCD,
  Slide08Competition,
  Slide09LeanCanvas,
  Slide10Team,
  Slide11Validation,
  Slide12Ask,
]

export default function App() {
  const { current, direction, goNext, goPrev, goTo, total } = useSlideNavigation(slides.length)
  const CurrentSlide = slides[current] ?? slides[0]!

  return (
    <div className="h-full w-full bg-bg">
      <SlideContainer slideKey={current} direction={direction}>
        <div className="w-full h-full">
          <CurrentSlide />
        </div>
      </SlideContainer>
      <Navigation
        current={current}
        total={total}
        goTo={goTo}
        goPrev={goPrev}
        goNext={goNext}
      />
    </div>
  )
}

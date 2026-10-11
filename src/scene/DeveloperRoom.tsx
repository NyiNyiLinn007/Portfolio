import { useEffect } from 'react'
import { Environment, Lightformer } from '@react-three/drei'
import { usePortfolio } from '@/app/PortfolioProvider'
import { useAppStore, type Quality } from '@/store/useAppStore'
import { Lighting } from './Lighting'
import { Door, RoomEnvironment, WindowFrame } from './RoomEnvironment'
import { CityWindow } from './CityWindow'
import { Desk, DeskClutter, DeskLamp, Headphones, KeyboardAndMouse, PCTower } from './Desk'
import { ComputerSetup } from './ComputerSetup'
import { MediaConsole, ProjectWall } from './ProjectWall'
import { Bookshelf } from './Bookshelf'
import { Beanbag, FloorLamp, GamingChair } from './Furniture'
import { Decor } from './Decor'
import { CoffeeMug, Notebook } from './DeskItems'
import { DustParticles } from './Particles'
import { InteractiveObject } from './InteractiveObject'
import { Occluder } from './primitives'

/** The complete room: static set dressing + the seven interactive objects. */
export function DeveloperRoom({ quality, reducedMotion }: { quality: Quality; reducedMotion: boolean }) {
  const data = usePortfolio()
  const markLoaded = useAppStore((s) => s.markLoaded)
  const animate = !reducedMotion

  useEffect(() => {
    markLoaded('scene')
  }, [markLoaded])

  return (
    <>
      <Lighting quality={quality} reducedMotion={reducedMotion} />
      {quality === 'high' && (
        // Procedural reflection environment (no HDR download): soft cyan/violet/warm light cards.
        <Environment resolution={64} frames={1} environmentIntensity={0.35}>
          <Lightformer form="rect" intensity={2} color="#22d3ee" position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[6, 2, 1]} />
          <Lightformer form="rect" intensity={2.5} color="#8b5cf6" position={[5, 2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 2, 1]} />
          <Lightformer form="rect" intensity={1.5} color="#93c5fd" position={[0, 2, -6]} scale={[8, 3, 1]} />
          <Lightformer form="circle" intensity={3} color="#ffb36b" position={[0.3, 3, -3]} scale={[1, 1, 1]} />
        </Environment>
      )}

      <RoomEnvironment />
      <CityWindow quality={quality} reducedMotion={reducedMotion} />

      <Occluder>
        <Desk />
        <KeyboardAndMouse />
        <DeskLamp />
        <Headphones />
        <DeskClutter />
        <PCTower />
        <GamingChair />
        <Beanbag />
        <FloorLamp />
        <Decor />
      </Occluder>
      <MediaConsole />

      <InteractiveObject id="about" reducedMotion={reducedMotion}>
        <ComputerSetup name={data.name} role={data.role} animate={animate} />
      </InteractiveObject>
      <InteractiveObject id="projects" reducedMotion={reducedMotion}>
        <ProjectWall projects={data.projects} animate={animate} />
      </InteractiveObject>
      <InteractiveObject id="skills" reducedMotion={reducedMotion}>
        <Bookshelf />
      </InteractiveObject>
      <InteractiveObject id="experience" reducedMotion={reducedMotion}>
        <Notebook />
      </InteractiveObject>
      <InteractiveObject id="funfacts" reducedMotion={reducedMotion}>
        <CoffeeMug animate={animate} />
      </InteractiveObject>
      <InteractiveObject id="social" reducedMotion={reducedMotion}>
        <WindowFrame />
      </InteractiveObject>
      <InteractiveObject id="contact" reducedMotion={reducedMotion}>
        <Door />
      </InteractiveObject>

      {quality === 'high' && animate && <DustParticles />}
    </>
  )
}

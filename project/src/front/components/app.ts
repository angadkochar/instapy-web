import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import { VNode, DOMSource } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
import isolate from '@cycle/isolate'
import { extractSinks } from 'cyclejs-utils'

import { driverNames } from '../drivers'
import { BaseSources, BaseSinks } from '../interfaces'
import { RouteValue, routes, initialRoute } from '../routes'

import { equals } from 'rambda'

// Typestyle setup
import { setupPage, normalize } from 'csstips'
normalize()
setupPage('#app')

export interface Sources extends BaseSources {
  onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
  onion?: Stream<Reducer>
}

// State
export interface State {
  // counter?: CounterState
  // speaker?: SpeakerState
}
export const defaultState: State = {
  counter: { count: 5 },
  speaker: undefined //use default state of component
};
export type Reducer = (prev?: State) => State | undefined;

const URL =
  process.env.NODE_ENV === 'development'
    ? 'localhost:9999'
    : process.env.DOMAIN
  // document
  //   .URL
  //   .split('/')[2]
  //   .split(':')[0]

const PROTOCOL =
  process.env.NODE_ENV === 'development'
    ? 'ws'
    : 'wss'

console.log(URL)

export function App(sources: Sources): Sinks {
  const initReducer$ = xs.of<Reducer>(
    prevState => (prevState === undefined ? defaultState : prevState)
  )

  const match$ = sources.router.define(routes)

  const componentSinks$ = match$.map(
    ({ path, value }: { path: string; value: RouteValue }) => {
      const { component, scope } = value
      const isolatedComponent =
        isolate
        (component, scope)
        ( { ...sources
          , router: sources.router.path(path)
          }
        )
      return isolatedComponent
    }
  )

  const sinks = extractSinks(componentSinks$, driverNames)
  const socket$ =
    sources
      .back
      .connection$
      .filter(equals(false))
      .mapTo([`${PROTOCOL}://${URL}`])

  const storedToken$ =
    sources
      .storage
      .session
      .getItem('jwt-token')

  const connect$ =
    sources
      .back
      .connection$
      .filter(equals(true))
      .compose(sampleCombine(storedToken$))
      .map(([first, second]) => second)
      .map
       ( (token) => (
           { TYPE: 'CONNECT'
           , DATA:
             { token: token
             }
           }
         )
       )

  const connectSucces$ =
    sources
      .back
      .succes('CONNECT')
      .mapTo('/bot')

  const connectError$ =
    sources
      .back
      .error('CONNECT')
      .mapTo('/login')

  return (
    { ...sinks
    , router: xs.merge(connectSucces$, connectError$, sinks.router)
    , onion: xs.merge(initReducer$, sinks.onion)
    , back: xs.merge(socket$, connect$, sinks.back.debug('actions'))
    }
  )
}

import { Component } from './interfaces'

import mainBackground from './assets/main-background.png'
import { LoginStyle
       , LoginTransitions
       , Login
       } from './components/login'

export type RouteValue =
  { component: Component
  , scope: string
  }

export type Routes =
  { readonly [index: string]: RouteValue }

const style =
  { color:
    { background: '#efd9ce'
    , backgroundImage: `url(${mainBackground})`
    // , backgroundImage: `url(${process.env.FRONT_URL}/assets/blurred-background.png)`
    , mainButton: '#7161ef'
    , subButton: '#f991cc'
    , mainText: '1c1d21'
    , subText: '#a288a6'
    }
  }

export const routes: Routes =
  { '/login': 
    { component: Login(LoginStyle(style), LoginTransitions)
    , scope: 'login'
    }
  // , '/p2': { component: Speaker, scope: 'speaker' }
  }

export const initialRoute = '/login'

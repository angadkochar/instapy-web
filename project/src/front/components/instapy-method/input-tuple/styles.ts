// styles
import { style} from 'typestyle'
import { vertical } from 'csstips'

const container =
  style
  ( { fontSize: '1em'
    , backgroundColor: '#eee'
    , borderTopStyle: 'solid'
    , borderTopColor: 'rgba(0,0,0,.6)'
    , borderTopWidth: '.1em'
    , overflow: 'hidden'
    , boxShadow: '0 .1em 0 .2em rgba(0,0,0,.2)'
    }
  , vertical
  )

const name =
  style
  ( { fontSize: '1.2em'
    , cursor: 'pointer'
    , background: '#bbb'
    , color: 'white'
    , padding: '.2em'
    , marginBottom: '.2em'
    }
  )

const args =
  style
  ( { color: '#444'
    }
  )

const hidden =
  style
  ( { display: 'none'
    }
  )

const included =
  style
  ( { background: '#6c6' }
  )

export
  { container
  , name
  , args
  , hidden
  , included
  }

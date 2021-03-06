import { setupControls } from 'instapy-tools'
import { EventEmitter } from 'events'

type Watch =
  (logStatus: string) => void
type Watcher =
  { add: (cb: Watch) => void
  , remove: (cb: Watch) => void
  }
type ControlManager =
  { start: () => Promise<string>
  , stop: () => Promise<string>
  , status: Watcher
  , logs: Watcher
  }
type SetupControlManager =
  (projectPath:string) => ControlManager
const setupControlManager: SetupControlManager =
  (projectPath) => {
    let botStatus = ''
    let botLogs: string[] = []
    let lastIndexLog = 0

    const controls = setupControls(projectPath)
    const controlEE = new EventEmitter()

    controlEE
      .on
       ( 'log'
       , (log:string) => {
           botLogs = [ ...botLogs, log ]
         }
       )

    controlEE
      .on
       ( 'status'
       , (status:string) => {
           botStatus = status
         }
       )

    controls
      .status
      .set((status) => { controlEE.emit('status', status) })

    const _presentLog =
      (cb:any) =>
        ([headLog, ...tailLogs]: string[]) => {
          if (headLog === undefined) {
          } else {
            cb(headLog)
            _presentLog(cb) (tailLogs)
          }
        }

    const _listenLog =
      () => {
        controls
          .logs
          .set((log) => { controlEE.emit('log', log) })
      }

    const _unlistenLog =
      () => {
        controls
          .logs
          .reset()
      }

    _listenLog()

    return (
      { start:
          () => {
            _unlistenLog()
            botLogs = []
            const started =
              controls
                .start()

            // _listenLog()
            started.then(_listenLog)
            return started
          }
      , stop:
          () => {
            _unlistenLog()
            return controls.stop()
          }
      , status:
        { add:
            (cb: any) => {
              cb(botStatus)
              controlEE.on('status', cb)
            }
        , remove:
            (cb: any) => {
              controlEE.off('status', cb)
            }
        }
      , logs:
        { add:
            (cb: any) => {
              _presentLog
              (cb) (botLogs)
              controlEE.on('log', cb)
            }
        , remove:
            (cb: any) => {
              controlEE.off('log', cb)
            }
        }
      }
    )
  }

export
  { setupControlManager
  , ControlManager
  , Watcher
  }

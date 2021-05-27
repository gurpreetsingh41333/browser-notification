import { useEffect, useState } from 'react'

import logo from './logo192.png'
import Modal from './Modal'

export const SESSION_DURATION = 120 // seconds
export const IDLE_WARNING_DURATION = 60 // seconds

const SystemTimeOut = () => {
  const [showWarningMsg, setWarningMsg] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(IDLE_WARNING_DURATION)
  const [warningIntervalId, setWarningIntervalId] = useState(null)

  /** this fn shows the borwser notification before 1 minute of warning popup */
  const showBrowserNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Are you still here!', {
        body: 'Your Casa session is about to expire!',
        icon: logo
      })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(() => {
        new Notification('Are you still here!', {
          body: 'Your Casa session is about to expire!',
          icon: logo
        })
      })
    }
  }

  /** this fn shows the warning popup and starts the logout countdown */
  const startWarningTimer = () => {
    setWarningMsg(true)
    let timeleft = IDLE_WARNING_DURATION
    const intervalId = setInterval(() => {
      timeleft -= 1
      if (timeleft <= 0) {
        setWarningMsg(false)
        console.log('successfully logged out')
        inactivityTracker()
      }
      setTimeRemaining(timeleft)
    }, 1000)
    setWarningIntervalId(intervalId)
  }

  /** this fn setup the inactivity listener */
  const inactivityTracker = () => {
    let notificationTimeOutId = null
    let inactivityTimeOutId = null
    const resetSession = () => {
      clearTimeout(notificationTimeOutId)
      clearInterval(warningIntervalId)
      /** show notification before 1 minute of warning popup */
      notificationTimeOutId = setTimeout(
        showBrowserNotification,
        (IDLE_WARNING_DURATION) * 1000
      )
      clearTimeout(inactivityTimeOutId)
      /** time is in milliseconds */
      inactivityTimeOutId = setTimeout(startWarningTimer, SESSION_DURATION * 1000)
    }
    resetSession()
    document.addEventListener('mousemove', resetSession)
    document.addEventListener('mousedown', resetSession)
    document.addEventListener('keypress', resetSession)
    document.addEventListener('touchmove', resetSession)
    document.addEventListener('scroll', resetSession, true)
  }

  const notifyMe = () =>{
    console.log('Notification.permission', Notification.permission);
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      new Notification("you're logged in");
    }
  
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          new Notification("you're logged in");
        }
      });
    }
  
    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
  }

  useEffect(() => {
    notifyMe()
    inactivityTracker()
  }, [])

  const keepSessionActive = () => {
    clearInterval(warningIntervalId)
    setTimeRemaining(IDLE_WARNING_DURATION)
    setWarningMsg(false)
  }

  return showWarningMsg ? (
    <Modal>
      <div>
        <div gutter={false} limitWidth={true}>
          <div>
            <div md={5} horizontalAlign="center">
              <div><logo /></div>
            </div>
            <div md={6}>
              <span bold size="small">Are you still here?</span>
              <div>
                <span block size="large">
                  {`
                    Your current session will expire in 
                    ${timeRemaining} 
                    seconds
                  `}
                </span>
              </div>
              <div bold vertical={3}>
                <span size="medium">For security reasons, we periodically check to see if you’re still here. You can stay logged in by clicking below.</span>
              </div>
              <div verticalAlign="middle">
                <div>
                  <button
                    primary
                    onClick={keepSessionActive}
                    id="keepLoggedInBtn"
                    name="keepLoggedInBtn"
                  >
                    keepLoggedIn
                  </button>
                </div>
                <button
                  onClick={()=>{console.log('logout clicked'); inactivityTracker()}}
                >
                  logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  ) : null
}

export default SystemTimeOut

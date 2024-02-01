/**
 * @file
 * 여기에 설명이 들어감
 */

/**
 *
 * @namespace {{}} WebBuilder - 아임웹 공통 모듈
 */
var WebBuilder = {}

/**
 * 메시지 통신 관련 함수
 * @module {{}} handleMessage - 메시지 통신 관련 함수
 */
WebBuilder.handleMessage = {}

/**
 * @type {NodeJS.Timer | null} intervalId - setInterval 생성시 intervalId 담아두고 추후 clear 처리
 */
WebBuilder.handleMessage.intervalId = null

/**
 * WebBuilder의 intervalId 에 값이 있으면 종료하는 함수
 */
WebBuilder.handleMessage.clearTimer = function () {
  if (this.intervalId) {
    clearInterval(this.intervalId)
    this.intervalId = null
  }
}

/**
 * 타겟 윈도우에게 500ms 간격으로 메시지를 보낸다 (frame script가 생성되기 전 메시지를 보내면 받을 수가 없기 때문에 지속적으로 보냄)
 * 메시지를 받은 frame은 sendReturnMessage 를 보내어 받았음을 안내
 * @param {Window | globalThis} targetWindow - 메시지를 보낼 타겟 윈도우 (부모: window.parent / 자식: document.querySelector('iframe').contentWindow)
 * @param {object | any} message - key는 필수속성으로 넣어주어야 함, 그 외 필요한 정보 추가
 * @param {string} origin - 수신받을 도메인 정보 (가급적 입력해주는 것이 좋음)
 * @param {Transferable[] | undefined} options - 일련의 transfer 객체 (en-US). 메세지와 함께 전송됩니다. 이 객체들의 소유권은 수신 측에게 전달되며, 더 이상 송신 측에서 사용할 수 없습니다.
 */
WebBuilder.handleMessage.sendMessage = function (targetWindow, message,
    origin = '*', options = undefined) {
  WebBuilder.handleMessage.clearTimer()
  this.intervalId = setInterval(() => {
    targetWindow.postMessage(message, origin, options)
  }, 500)
}

/**
 * 메시지 수신 함수
 * @param {(args: any) => void} callbackFunc - 메시지 수신시 실행할 콜백 함수
 * @param {string} messageKey - 메시지 수신시 분류를 위한 키값
 * @param {Window | globalThis} targetWindow - 메시지를 받을 타겟 윈도우 (기본값: window)
 * @param {boolean | AddEventListenerOptions | undefined} eventOptions - message 이벤트 옵션
 */
WebBuilder.handleMessage.receiveMessage = function (callbackFunc, messageKey,
    targetWindow = window, eventOptions = undefined,) {
  targetWindow.addEventListener('message', function (event) {
    console.log('receiveMessage', event.data)
    if (event.data.key === messageKey) {
      callbackFunc(event)
    }
  }, eventOptions)
}

/**
 * 메시지를 받은 프레임에서 메시지를 보낸 곳에 메시지 수신여부를 보냄
 * @param {Window | globalThis} targetWindow - 메시지를 보낼 타겟 윈도우 (부모: window.parent / 자식: document.querySelector('iframe').contentWindow)
 * @param {string} origin - 수신받을 도메인 정보 (내가 메시지를 받은 도메인에게 보내는 것이 좋음)
 * @param {Transferable[] | undefined} options - 일련의 transfer 객체 (en-US). 메세지와 함께 전송됩니다. 이 객체들의 소유권은 수신 측에게 전달되며, 더 이상 송신 측에서 사용할 수 없습니다.
 */
WebBuilder.handleMessage.sendReturnMessage = function (targetWindow,
    origin = '*', options = undefined) {
  targetWindow.postMessage({key: 'frameReturnMessage'}, origin, options)
}

/**
 * 메시지를 보낸 프레임에서 메시지를 보낸 곳으로부터 메시지 수신여부를 받았을 때 지속적으로 보내던 sendMessage timer를 종료함
 * @param {Window | globalThis} targetWindow - 메시지를 받을 타겟 윈도우 (기본값: window)
 * @param {boolean | AddEventListenerOptions | undefined} eventOptions - message 이벤트 옵션
 */
WebBuilder.handleMessage.receiveReturnMessage = function (targetWindow = window,
    eventOptions = undefined) {
  targetWindow.addEventListener('message', function (event) {
    console.log('receiveReturnMessage', event.data)
    if (event.data.key === 'frameReturnMessage') {
      WebBuilder.handleMessage.clearTimer()
    }
  }, eventOptions)
}

/**
 * 메시지로 받은 정보를 session storage에 담음
 * key는 필수값
 * @param {string} messageKey
 * @param {object} messageObj
 */
WebBuilder.handleMessage.saveMessageInSessionStorage = function (messageKey,
    messageObj) {
  const saveData = JSON.stringify(messageObj)
  console.log('saveMessageInSessionStorage: ', messageKey, saveData)
  sessionStorage.setItem(messageKey, saveData)
}

/**
 * session storage 에서 key로 정보를 꺼내옴
 * @param {string} messageKey - 메시지 정보를 꺼내올 key값
 * @return {object | null} - parcing한 메시지 정보
 */
WebBuilder.handleMessage.getMessageInSessionStorage = function (messageKey) {
  const sessionData = sessionStorage.getItem(messageKey)
  console.log('getMessageInSessionStorage: ', messageKey, sessionData)
  return sessionData ? JSON.parse(sessionData) : null
}

/**
 *
 * @param url
 */
WebBuilder.handleOpenInNewTab = function (url) {
  window.open(url, '_blank')
}

WebBuilder.handleChangeLinkOfCurrentTab = function (url) {
  window.location.href = url
}

/**
 * gtm tagging
 * @param {string} eventName - 이벤트명
 * @param {Object} params - tagging 할 데이어들
 * */
WebBuilder.handleGtmTagging = function (eventName, params) {
  try {
    window.dataLayer = window.dataLayer || []
    let tag = {event: eventName}
    tag = Object.assign(tag, params)
    dataLayer.push(tag)

    console.log(`%c[GoogleTagManager]`, 'background: #ffcc4d; color: #000; font-weight: 700;', tag)
  } catch (e) {
    console.log(`[handleGtmTagging]: ${e}`);
  }
}

/**
 * @file 아임웹 등 웹빌더 공통 모듈 생성 파일
 * @module WEFUN 아임웹 등 웹빌더 공통 모듈
 * @module handleMessage 메시지 통신관련 모듈
 * @module handleTally 탈리 관련 모듈
 * @module handleOpenInNewTab 페이지 새탭 오픈 함수
 * @module handleChangeLinkOfCurrentTab 페이지 현재탭 전환 함수
 * @module handleGtmTagging gtm 태깅 함수
 */

(function (_) {
  /**
   * argumentParams 저장 변수
   * @type {string}
   */
  let argumentParams = '';

  /**
   * message 실행 콜백 함수
   * @param {function} callbackFunc
   * @param {string} messageKey
   */
  const messageListener = (callbackFunc, messageKey) => (event) => {
    if (event.data.key === messageKey) {
      callbackFunc(event)
    }
  }

  /**
   * 에러 로그
   * @param {any} e
   */
  const errorLog = (e) => {
    if (e instanceof Error) {
      console.log(e.message)
    } else {
      console.log('An unexpected error occurred: ', e)
    }
  }

  /**
   * window.WEFUN 전역 객체
   */
  _.WEFUN = {
    /**
     * 메시지 통신 관련 함수
     */
    handleMessage: {
      /**
       * 타겟 윈도우에게 500ms 간격으로 메시지를 보낸다 (frame script가 생성되기 전 메시지를 보내면 받을 수가 없기 때문에 지속적으로 보냄)
       * 메시지를 받은 frame은 sendReturnMessage 를 보내어 받았음을 안내
       * @param {Window | globalThis} targetWindow 메시지를 보낼 타겟 윈도우 (부모: window.parent / 자식: document.querySelector('iframe').contentWindow)
       * @param {object | any} message key는 필수속성으로 넣어주어야 함, 그 외 필요한 정보 추가
       * @param {string} origin 수신받을 도메인 정보 (가급적 입력해주는 것이 좋음)
       * @param {Transferable[] | undefined} options 일련의 transfer 객체 (en-US). 메세지와 함께 전송됩니다. 이 객체들의 소유권은 수신 측에게 전달되며, 더 이상 송신 측에서 사용할 수 없습니다.
       */
      sendMessage: function (targetWindow, message, origin = '*',
          options = undefined) {
        try {
          targetWindow.postMessage(message, origin, options)
        } catch (e) {
          errorLog(e)
        }
      },
      /**
       * 메시지 수신 함수
       * @param {(args: any) => void} callbackFunc 메시지 수신시 실행할 콜백 함수
       * @param {string} messageKey 메시지 수신시 분류를 위한 키값
       * @param {Window | globalThis} targetWindow 메시지를 받을 타겟 윈도우 (기본값: window)
       * @param {boolean | AddEventListenerOptions | undefined} eventOptions message 이벤트 옵션
       */
      receiveMessage: function (callbackFunc, messageKey, targetWindow = window,
          eventOptions = undefined) {
        try {
          targetWindow.addEventListener('message',
              messageListener(callbackFunc, messageKey), eventOptions)
        } catch (e) {
          errorLog(e)
        }
      },
      /**
       * 메시지로 받은 정보를 session storage에 담음
       * @param {string} messageKey 저장시 이름
       * @param {object} messageObj 저장할 메시지 정보
       */
      saveMessageInSessionStorage: function (messageKey, messageObj) {
        try {
          const saveData = JSON.stringify(messageObj)
          sessionStorage.setItem(messageKey, saveData)
        } catch (e) {
          errorLog(e)
        }
      },
      /**
       * session storage 에서 messageKey 로 정보를 가져옴
       * @param {string} messageKey 메시지 정보를 꺼내올 key값
       * @returns {object | null} parcing한 메시지 정보
       */
      getMessageInSessionStorage: function (messageKey) {
        try {
          const sessionData = sessionStorage.getItem(messageKey)
          return sessionData ? JSON.parse(sessionData) : null
        } catch (e) {
          errorLog(e)
          return null
        }
      }
    },
    /**
     * 탈리 관련 모듈
     */
    handleTally: {
      /**
       * 탈리 모달을 연다
       * @param {string} modalId 특정 모달을 열기 위한 모달 id 값
       */
      openTally: function (modalId) {
        try {
          if (!_.SITE) {
            throw new Error('SITE is not found')
          }
          if (!_.SITE.openModalMenu) {
            throw new Error('SITE.openModalMenu is not found')
          }

          _.SITE.openModalMenu(modalId)
        } catch (e) {
          errorLog(e)
        }
      },
      /**
       * 탈리 모달을 열고 데이터를 삽입한다
       * @param {string} modalId 특정 모달을 열기 위한 모달 id 값
       * @param {string[]} arguments 삽입할 데이터 나열 값
       */
      openTallyAndSetData: function (modalId, ...arguments) {
        try {
          if (!_.SITE) {
            throw new Error('SITE is not found')
          }
          if (!_.SITE.openModalMenu) {
            throw new Error('SITE.openModalMenu is not found')
          }

          _.SITE.openModalMenu(modalId)

          argumentParams = "&" + arguments.join("&")
        } catch (e) {
          errorLog(e)
        }
      },
    },
    /**
     * Google Tag Manager 에 태깅 작업
     * @param {string} eventName - 이벤트 이름
     * @param {object} tagObj - 태그 정보
     */
    handleGtmTagging: function (eventName, tagObj) {
      try {
        window.dataLayer = window.dataLayer || []
        let tag = {event: eventName}
        Object.assign(tag, tagObj)
        dataLayer.push(tag)
        console.log(`%c[GoogleTagManager]`,
            'background: #ffcc4d; color: #000; font-weight: 700;', tag)
      } catch (e) {
        errorLog(e)
      }
    },
    /**
     * 사이트의 주소를 받아서 새로운 탭으로 화면 오픈
     * @param {string} url 사이트 주소
     */
    handleOpenInNewTab: function (url) {
      window.open(url, '_blank')
    },
    /**
     * 사이트의 주소를 받아서 현재 탭으로 화면 전환
     * @param {string} url 사이트 주소
     */
    handleChangeLinkOfCurrentTab: function (url) {
      window.location.href = url
    },
    /**
     * 뷰포트에 노출될 옵저버 리턴
     * @param {function} callback 변경될 element 확인 후 실행할 콜백함수
     * @returns {MutationObserver}
     */
    handleGetMutationObserver: function (callback) {
      let timer = null;
      return new MutationObserver(function (mutationList, observer) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(() => {
          const mutation = mutationList?.[0];
          if (mutation && mutation.type === 'childList') {
            const pcTally = document.getElementById("tally-3jl6bQ")
            const mobileTally = document.getElementById('tally-mOQ5kp-mobile')
            if (pcTally) {
              callback(pcTally)
            }

            if (mobileTally) {
              callback(mobileTally)
            }
          }
        }, 1000);
      })
    },
    /**
     * argumentParams 을 내보냄
     * @returns {string}
     */
    getArgumentParams: function () {
      return argumentParams
    }
  }
})(window)

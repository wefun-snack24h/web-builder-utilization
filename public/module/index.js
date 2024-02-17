/**
 * @file 아임웹 등 웹빌더 공통 모듈 생성 파일
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
   * @module WEFUN
   * window.WEFUN 전역 객체
   */
  _.WEFUN = {
    /**
     * 메시지 통신 관련 함수
     */
    handleMessage: {
      /**
       * 메시지 전송 함수
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
        const session = _.WEFUN.handleMessage.getMessageInSessionStorage(
            'wefun_info')
        Object.assign(tag, tagObj, {route: session?.route || '아임웹'})
        dataLayer.push(tag)
        console.log(`%c[GoogleTagManager]`, 'background: #ffcc4d; color: #000; font-weight: 700;', tag)
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
     * @param {string[]} targetIds 감시할 타겟의 아이디 리스트
     * @returns {MutationObserver}
     */
    handleGetMutationObserver: function (callback,
        targetIds = ['tally-3jl6bQ', 'tally-mOQ5kp-mobile',
          'tally-3jl6bQ-mobile']) {
      let timer = null;
      return new MutationObserver(function (mutationList, observer) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(() => {
          const mutation = mutationList?.[0];
          if (mutation && mutation.type === 'childList') {
            targetIds.forEach((id) => {
              const target = document.getElementById(id)
              if (target) {
                callback(target)
              }
            })
          }

          if (timer) {
            clearTimeout(timer);
          }
        }, 700);
      })
    },
    /**
     * argumentParams 을 내보냄
     * @returns {string}
     */
    getArgumentParams: function () {
      return argumentParams
    },
    /**
     * origin, utm tag 생성
     * @param inHome
     * @returns {string}
     */
    getUtmTags: function (inHome = false) {
      const wefunInfo = _.WEFUN.handleMessage.getMessageInSessionStorage(
          'wefun_info')
      const tagInfo = wefunInfo?.route === '관리자페이지' ? 'fromportal'
          : 'websiteofficial'

      // return tags
      const tags = []

      // origin 생성 trigger
      let originCreateTrigger = true

      // originCreateTrigger 가 true 일 때, utm을 origin으로 변경할 tags
      let changeOriginTags = []
      // originCreateTrigger 가 false 일 때, origin tags 그대로 저장
      let originTags = []

      // TODO: 여기 document.referrer로 변경
      const searchParams = document.referrer === '' ? new URL(location.href).searchParams : new URL(document.referrer).searchParams
      searchParams.forEach((paramValue, paramKey) => {
        // params 에 origin key를 가지고 있으므로 trigger false
        if (paramKey.includes('origin')) {
          originCreateTrigger = false
          originTags.push(paramKey + '=' + paramValue)
        } else if (paramKey.includes('utm')) {
          changeOriginTags.push(
              'origin_' + paramKey.replace('utm_', '') + '=' + paramValue)
        }
      })

      // origin 여부에 따라 origin tags 분기
      if (originCreateTrigger) {
        tags.push(...changeOriginTags)
      } else {
        tags.push(...originTags)
      }

      // 생성할 utm tags
      const tagTypes = ['source', 'medium', 'campaign', 'term']

      for (let tag of tagTypes) {
        if (tag === 'medium') {
          tags.push('utm_' + tag + '=' + (inHome ? 'home' : tagInfo))
        } else {
          tags.push('utm_' + tag + '=' + tagInfo)
        }
      }

      return tags.join('&')
    }
  }

  /**
   * @module WEFUN_HOME
   * 아임웹 홈에서 사용하는 모듈
   */
  _.WEFUN_HOME = {
    /**
     * 입력받은 url로 페이지 링크 이동 (홈에서 클릭시)
     * @param {string} url 이동할 url
     */
    handleClickUrl: function (url) {
      const wefunInfo = _.WEFUN.handleMessage.getMessageInSessionStorage(
          'wefun_info');

      // 관리자 페이지에서 페이지 이동
      if (wefunInfo && wefunInfo.route === '관리자페이지') {
        const openLink = 'https://www.snack24h.com/pc/admin/featpaper/service?url='
            + url
        _.WEFUN.handleOpenInNewTab(openLink)
      }
      // 관리자 페이지가 아닌 경우
      else {
        // LNB: 법인세 비용 절감
        if (url.includes('donation24.imweb.me')) {
          const href = 'https://snack24gd.imweb.me/?category_name=donation24'
          _.WEFUN.handleMessage.sendMessage(window.parent,
              {href, key: 'wefun_tabPanelContents'})
          return;
        }

        // LNB: 친환경 컵 150원
        if (url.includes('eco24h.imweb.me')) {
          const href = 'https://snack24gd.imweb.me/?category_name=eco24'
          _.WEFUN.handleMessage.sendMessage(window.parent,
              {href, key: 'wefun_tabPanelContents'})
          return;
        }

        // LNB: 기타 모든 LNB
        const pathname = new URL(url).pathname;
        const href = 'https://snack24gd.imweb.me/?category_name='
            + pathname.slice(pathname.lastIndexOf('/') + 1)

        _.WEFUN.handleMessage.sendMessage(window.parent,
            {href, key: 'wefun_tabPanelContents'})
      }
    },
    /**
     * iframe url 변경
     * @param {string} iframeId iframe 아이디
     * @param {string} iframeSrc 변경할 iframe url
     */
    handleChangeIframeSrc: function (iframeId, iframeSrc) {
      const iframe = document.getElementById(iframeId);
      if (iframe) {
        iframe.src = iframeSrc
      }
    },
    /**
     * iframe 높이 변경
     * @param {string} iframeId iframe 아이디
     * @param {number} height iframe 높이 값
     */
    handleChangeIframeHeight: function (iframeId, height) {
      const iframe = document.getElementById(iframeId);
      if (iframe) {
        iframe.style.height = `${height}px`
      }
    },
    /**
     * 홈 카테고리 변경
     * @param {string} pathname 카테고리 전환할 key 값 (생성된 페이지(아임웹)의 pathname)
     */
    handleChangeHomeCategory: function (pathname) {
      _.WEFUN_HOME.findSelectedTabName(pathname)
      _.WEFUN_HOME.handleChangeIframeSrc('adminHomeTabPanel',
          'https://snack24gd.imweb.me/' + pathname)

      const tabList = document.getElementById('adminHomeTabList');
      if (tabList) {
        tabList.scrollIntoView({behavior: 'smooth', block: 'start'})
      }
    },
    /**
     * home tab name 찾아서 selected class 적용
     * @param {string} pathname selected 적용할 target의 key 값
     */
    findSelectedTabName: function (pathname) {
      const tabNames = document.getElementsByClassName('home-tab-name');
      if (tabNames) {
        for (let i = 0; i < tabNames.length; i++) {
          const target = tabNames[i];
          if (target.dataset.key === pathname) {
            target.classList.add('selected')
          } else {
            target.classList.remove('selected')
          }
        }
      }
    }
  }
})(window)

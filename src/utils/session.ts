const LOGIN_COOKIE_NAME = 'sessionId'

export function isAuthenticated () {
  return _getCookie(LOGIN_COOKIE_NAME)
}

export function authenticateSuccess (token: string) {
  _setCookie(LOGIN_COOKIE_NAME, token, 24 * 60 * 60 * 1000);
}

export function logout () {
  _setCookie(LOGIN_COOKIE_NAME, '', 0);
  localStorage.removeItem('loginUser');
}

function _getCookie (name: string) {
  let start, end
  if (document.cookie.length > 0) {
    start = document.cookie.indexOf(name + '=')
    if (start !== -1) {
      start = start + name.length + 1
      end = document.cookie.indexOf(';', start)
      if (end === -1) {
        end = document.cookie.length
      }
      return decodeURI(document.cookie.substring(start, end))
    }
  }
  return ''
}

function _setCookie (name: string, value: any, expire: any) {
  let date = new Date()
  date.setDate(date.getDate() + expire)
  document.cookie = name + '=' + encodeURI(value) + '; path=/' +
    (expire ? ';expires=' + date.toUTCString() : '')
}
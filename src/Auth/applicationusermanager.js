import {
  UserManager
} from 'oidc-client'

// 使用id4更改这里1
class ApplicationUserManager extends UserManager {
  constructor() {

    super({
      authority: 'http://ids.chaego.top',
      client_id: 'blogadminjs',
      redirect_uri: 'http://jd.chaego.top/callback',
      response_type: 'id_token token',
      scope: 'openid profile roles blog.core.api',
      post_logout_redirect_uri: 'http://jd.chaego.top/'
    })

    // super({
    //   authority: 'http://ids.chaego.top',
    //   client_id: 'blogadminjs',
    //   redirect_uri: 'http://127.0.0.1:2364/callback',
    //   response_type: 'id_token token',
    //   scope: 'openid profile roles blog.core.api',
    //   post_logout_redirect_uri: 'http://127.0.0.1:2364/'
    // })
  }

  async login() {
    await this.signinRedirect()
    return this.getUser()
  }

  async logout() {
    return this.signoutRedirect()
  }
}

const applicationUserManager = new ApplicationUserManager()
export {
  applicationUserManager as
  default
}
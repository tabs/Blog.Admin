import { UserManager } from 'oidc-client'

// 使用id4更改这里1
class ApplicationUserManager extends UserManager {
  constructor () {
    // super({
    //   authority: 'https://ids.neters.club',
    //   client_id: 'blogadminjs',
    //   redirect_uri: 'https://vueadmin.neters.club/callback',
    //   response_type: 'id_token token',
    //   scope: 'openid profile roles blog.core.api',
    //   post_logout_redirect_uri: 'https://vueadmin.neters.club'
    // })
        super({
      authority: 'http://localhost:5004',
      client_id: 'blogadminjs',
      redirect_uri: 'http://localhost:2364/callback',
      response_type: 'id_token token',
      scope: 'openid profile roles blog.core.api',
      post_logout_redirect_uri: 'http://localhost:2364/'
    })
  }

  async login () {
    await this.signinRedirect()
    return this.getUser()
  }

  async logout () {
    return this.signoutRedirect()
  }
}

const applicationUserManager = new ApplicationUserManager()
export { applicationUserManager as default }

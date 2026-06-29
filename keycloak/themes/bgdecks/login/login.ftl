<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>BGDecks — Вход</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css">
</head>
<body>
  <div class="card">

    <div class="logo">BGDecks</div>
    <p class="subtitle">Войдите в свой аккаунт</p>

    <#-- Global message (wrong credentials, session expired, etc.) -->
    <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
      <div class="alert alert-${message.type}">
        ${kcSanitize(message.summary)?no_esc}
      </div>
    </#if>

    <form action="${url.loginAction}" method="post">

      <#-- Username / Email -->
      <div class="field">
        <label for="username">
          <#if !realm.loginWithEmailAllowed>Имя пользователя
          <#elseif !realm.registrationEmailAsUsername>Имя пользователя или email
          <#else>Email</#if>
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value="${(login.username!'')}"
          autofocus
          autocomplete="username"
          <#if usernameEditDisabled??>disabled</#if>
        >
        <#if messagesPerField.existsError('username')>
          <span class="field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</span>
        </#if>
      </div>

      <#-- Password -->
      <div class="field">
        <div class="field-header">
          <label for="password">Пароль</label>
          <#if realm.resetPasswordAllowed>
            <a href="${url.loginResetCredentialsUrl}" class="link-muted">Забыли пароль?</a>
          </#if>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="current-password"
        >
        <#if messagesPerField.existsError('password')>
          <span class="field-error">${kcSanitize(messagesPerField.get('password'))?no_esc}</span>
        </#if>
      </div>

      <#-- Remember me -->
      <#if realm.rememberMe && !usernameEditDisabled??>
        <div class="remember-me">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            <#if login.rememberMe?string('on','') == 'on'>checked</#if>
          >
          <label for="rememberMe">Запомнить меня</label>
        </div>
      </#if>

      <input type="hidden" id="id-hidden-input" name="credentialId"
        <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>>

      <button type="submit" class="btn-primary">Войти</button>

    </form>

    <#-- Social / identity providers -->
    <#if realm.password && social.providers?has_content>
      <div class="divider"><span>или</span></div>
      <div class="social-providers">
        <#list social.providers as p>
          <a href="${p.loginUrl}" class="btn-social">
            <#if p.iconClasses?has_content>
              <i class="${p.iconClasses}" aria-hidden="true"></i>
            </#if>
            ${p.displayName!''}
          </a>
        </#list>
      </div>
    </#if>

    <#-- Registration link -->
    <#if realm.registrationAllowed && !registrationDisabled??>
      <p class="register-link">
        Нет аккаунта? <a href="${url.registrationUrl}" class="link">Зарегистрироваться</a>
      </p>
    </#if>

  </div>
</body>
</html>

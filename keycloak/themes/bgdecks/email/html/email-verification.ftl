<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Подтверждение почты — BGDecks</title>
</head>
<body style="margin:0;padding:0;background-color:#0A0907;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0A0907;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#171410;border:1px solid #1F1C16;border-radius:8px;overflow:hidden;">

          <!-- Header with gold top-border -->
          <tr>
            <td style="height:3px;background-color:#9E7C2E;"></td>
          </tr>

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding:36px 40px 24px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 12px 0 0;">
                    <!-- Ornamental diamond accent -->
                    <span style="display:inline-block;width:8px;height:8px;background-color:#9E7C2E;transform:rotate(45deg);"></span>
                  </td>
                  <td>
                    <span style="font-size:22px;font-weight:700;letter-spacing:0.08em;color:#E8E4DC;">BGDecks</span>
                  </td>
                  <td style="padding:0 0 0 12px;">
                    <span style="display:inline-block;width:8px;height:8px;background-color:#9E7C2E;transform:rotate(45deg);"></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#28241C;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 24px;">

              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9E7C2E;font-weight:600;">
                Подтверждение аккаунта
              </p>

              <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#E8E4DC;line-height:1.3;">
                Подтвердите ваш email
              </h1>

              <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#B8B098;">
                Добро пожаловать в <span style="color:#D4CCBC;font-weight:600;">BGDecks</span>!<br/>
                Для завершения регистрации нажмите на кнопку ниже.
              </p>

              <p style="margin:0 0 28px;font-size:14px;line-height:1.7;color:#928870;">
                Ссылка действительна в течение <span style="color:#B8B098;">${linkExpiry}</span>.
              </p>

            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:0 40px 32px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#9E7C2E;border-radius:4px;">
                    <a href="${link}"
                       style="display:inline-block;padding:13px 36px;font-size:14px;font-weight:600;letter-spacing:0.06em;color:#0A0907;text-decoration:none;">
                      Подтвердить email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="padding:0 40px 8px;">
              <div style="height:1px;background-color:#1F1C16;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 40px 8px;">
              <p style="margin:0 0 6px;font-size:12px;color:#6E6650;">
                Если кнопка не работает, скопируйте ссылку в браузер:
              </p>
              <p style="margin:0;font-size:12px;word-break:break-all;">
                <a href="${link}" style="color:#9E7C2E;text-decoration:none;">${link}</a>
              </p>
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td style="padding:16px 40px 32px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%"
                     style="background-color:#100E0B;border:1px solid #28241C;border-radius:4px;padding:12px 16px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;line-height:1.6;color:#6E6650;">
                      Если вы не регистрировались на <span style="color:#928870;">BGDecks</span>,
                      просто проигнорируйте это письмо — никаких действий не требуется.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#100E0B;border-top:1px solid #1F1C16;padding:20px 40px;">
              <p style="margin:0;font-size:11px;color:#524C38;text-align:center;letter-spacing:0.04em;">
                © BGDecks · Это автоматическое письмо, не отвечайте на него
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>

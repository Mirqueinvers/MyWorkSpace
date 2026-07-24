import { useState } from 'react'

const ELECTRON_API_UNAVAILABLE = 'API Electron недоступно. Откройте приложение через dev:electron.'

function formatMacAddress(value: string) {
  const digits = value.replace(/[^a-fA-F0-9]/g, '')
  const parts = []
  for (let i = 0; i < digits.length && i < 12; i += 2) {
    parts.push(digits.slice(i, i + 2))
  }
  return parts.join(':')
}

export function NetworkSection() {
  const [ip, setIp] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [macAddress, setMacAddress] = useState('')
  const [broadcastIp, setBroadcastIp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [wolLoading, setWolLoading] = useState(false)
  const [shutdownLoading, setShutdownLoading] = useState(false)
  const [restartLoading, setRestartLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [confirmShutdown, setConfirmShutdown] = useState(false)
  const [confirmRestart, setConfirmRestart] = useState(false)

  function clearMessages() {
    setError('')
    setSuccess('')
  }

  async function handleWakeOnLan() {
    clearMessages()

    const trimmedMac = macAddress.replace(/[^a-fA-F0-9]/g, '').toLowerCase()
    if (!/^[a-f0-9]{12}$/.test(trimmedMac)) {
      setError('Введите корректный MAC-адрес (6 пар шестнадцатеричных цифр).')
      return
    }

    if (!window.electronAPI?.network?.wakeOnLan) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setWolLoading(true)

    try {
      await window.electronAPI.network.wakeOnLan(trimmedMac, broadcastIp.trim() || undefined)
      setSuccess(`Magic Packet отправлен на MAC ${formatMacAddress(trimmedMac)}`)
    } catch (wolError) {
      if (wolError instanceof Error && wolError.message) {
        setError(`Ошибка WOL: ${wolError.message}`)
      } else {
        setError('Не удалось отправить Magic Packet.')
      }
    } finally {
      setWolLoading(false)
    }
  }

  async function handleShutdown() {
    clearMessages()

    const trimmedIp = ip.trim()
    if (!trimmedIp) {
      setError('Укажите IP-адрес удалённого ПК.')
      return
    }

    if (!window.electronAPI?.network?.remoteShutdown) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setShutdownLoading(true)

    try {
      await window.electronAPI.network.remoteShutdown({
        ip: trimmedIp,
        username: username.trim() || undefined,
        password: password || undefined,
        timeoutSeconds: 10,
      })
      setSuccess(`Команда выключения отправлена на ${trimmedIp}`)
      setConfirmShutdown(false)
    } catch (shutdownError) {
      if (shutdownError instanceof Error && shutdownError.message) {
        const message = shutdownError.message.replace('SHUTDOWN_FAILED: ', '')
        setError(`Ошибка выключения: ${message}`)
      } else {
        setError('Не удалось выключить удалённый ПК.')
      }
    } finally {
      setShutdownLoading(false)
    }
  }

  async function handleTestConnection() {
    clearMessages()
    setTestResult(null)

    const trimmedIp = ip.trim()
    if (!trimmedIp) {
      setError('Укажите IP-адрес удалённого ПК.')
      return
    }

    if (!window.electronAPI?.network?.testConnection) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setTestLoading(true)

    try {
      const result = await window.electronAPI.network.testConnection({
        ip: trimmedIp,
        username: username.trim() || undefined,
        password: password || undefined,
      })
      setTestResult(result)
    } catch (testError) {
      if (testError instanceof Error && testError.message) {
        setError(`Ошибка: ${testError.message}`)
      } else {
        setError('Ошибка при проверке подключения.')
      }
    } finally {
      setTestLoading(false)
    }
  }

  async function handleRestart() {
    clearMessages()

    const trimmedIp = ip.trim()
    if (!trimmedIp) {
      setError('Укажите IP-адрес удалённого ПК.')
      return
    }

    if (!window.electronAPI?.network?.remoteRestart) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setRestartLoading(true)

    try {
      await window.electronAPI.network.remoteRestart({
        ip: trimmedIp,
        username: username.trim() || undefined,
        password: password || undefined,
        timeoutSeconds: 10,
      })
      setSuccess(`Команда перезагрузки отправлена на ${trimmedIp}`)
      setConfirmRestart(false)
    } catch (restartError) {
      if (restartError instanceof Error && restartError.message) {
        const message = restartError.message.replace('RESTART_FAILED: ', '')
        setError(`Ошибка перезагрузки: ${message}`)
      } else {
        setError('Не удалось перезагрузить удалённый ПК.')
      }
    } finally {
      setRestartLoading(false)
    }
  }

  return (
    <section className="content-card">
      <h2 className="section-title">Управление ПК по сети</h2>

      <div className="network-section">
        {/* Wake-on-LAN */}
        <div className="network-card">
          <h3 className="network-card-title">Включение (Wake-on-LAN)</h3>
          <div className="network-form-row">
            <input
              type="text"
              className="input"
              value={macAddress}
              onChange={(event) => {
                const raw = event.target.value
                const cleaned = raw.replace(/[^a-fA-F0-9:]/g, '')
                const formatted = cleaned
                  .split(':')
                  .filter(Boolean)
                  .join(':')
                  .slice(0, 17)
                setMacAddress(formatted.toUpperCase())
              }}
              placeholder="MAC-адрес (00:11:22:33:44:55)"
            />
          </div>
          <div className="network-form-row">
            <input
              type="text"
              className="input"
              value={broadcastIp}
              onChange={(event) => setBroadcastIp(event.target.value)}
              placeholder="Broadcast IP (по умолчанию 255.255.255.255)"
            />
          </div>
          <div className="network-form-row">
            <button
              type="button"
              className="primary-button"
              onClick={() => void handleWakeOnLan()}
              disabled={wolLoading}
            >
              {wolLoading ? 'Отправляю...' : 'Включить'}
            </button>
          </div>
        </div>

        {/* Remote Shutdown / Restart */}
        <div className="network-card">
          <h3 className="network-card-title">Выключение / Перезагрузка</h3>
          <div className="network-form-row">
            <input
              type="text"
              className="input"
              value={ip}
              onChange={(event) => setIp(event.target.value)}
              placeholder="IP-адрес удалённого ПК (например, 192.168.0.126)"
            />
          </div>
          <div className="network-form-row">
            <input
              type="text"
              className="input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Имя пользователя (ПК\Логин или Логин)"
            />
          </div>
          <div className="network-form-row">
            <input
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Пароль"
            />
          </div>
          <div className="network-form-row">
            <button
              type="button"
              className="secondary-button"
              onClick={() => void handleTestConnection()}
              disabled={testLoading}
            >
              {testLoading ? 'Проверяю...' : 'Проверить подключение'}
            </button>
          </div>
          {testResult ? (
            <div className="network-form-row">
              <p className={`network-message ${testResult.success ? 'network-success' : 'network-error'}`}>
                {testResult.message}
              </p>
            </div>
          ) : null}
          <div className="network-form-row network-button-group">
            {!confirmShutdown ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  clearMessages()
                  if (!ip.trim()) {
                    setError('Укажите IP-адрес удалённого ПК.')
                    return
                  }
                  setConfirmShutdown(true)
                }}
              >
                Выключить
              </button>
            ) : (
              <div className="network-confirm-row">
                <span>Выключить {ip.trim()}?</span>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => void handleShutdown()}
                  disabled={shutdownLoading}
                >
                  {shutdownLoading ? 'Выключаю...' : 'Да'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setConfirmShutdown(false)}
                >
                  Нет
                </button>
              </div>
            )}

            {!confirmRestart ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  clearMessages()
                  if (!ip.trim()) {
                    setError('Укажите IP-адрес удалённого ПК.')
                    return
                  }
                  setConfirmRestart(true)
                }}
              >
                Перезагрузить
              </button>
            ) : (
              <div className="network-confirm-row">
                <span>Перезагрузить {ip.trim()}?</span>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => void handleRestart()}
                  disabled={restartLoading}
                >
                  {restartLoading ? 'Перезагружаю...' : 'Да'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setConfirmRestart(false)}
                >
                  Нет
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <p className="network-message network-error">{error}</p>
      ) : null}
      {success ? (
        <p className="network-message network-success">{success}</p>
      ) : null}

      <div className="network-info">
        <h4>Требования:</h4>
        <ul>
          <li><strong>Включение (WOL):</strong> BIOS: Wake-on-LAN включён, в Windows: драйвер сетевой карты разрешает Magic Packet, быстрый запуск отключён</li>
          <li><strong>Выключение:</strong> На целевом ПК: реестр <code>LocalAccountTokenFilterPolicy = 1</code>, служба Remote Registry запущена</li>
          <li>Если учётные записи не совпадают — укажите Имя пользователя и Пароль для подключения к целевому ПК</li>
          <li>Все ПК должны быть в одной локальной сети</li>
        </ul>
      </div>
    </section>
  )
}
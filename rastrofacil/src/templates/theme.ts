import { loggiTheme } from './loggi/theme'
import { loggzTheme } from './loggz/theme'

/**
 * Registry de temas disponíveis.
 * As chaves devem coincidir com o valor salvo em CompanySettings.theme
 */
export const themes: Record<string, any> = {
  loggi: loggiTheme,
  loggz: loggzTheme,
}

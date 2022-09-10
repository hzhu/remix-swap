export type Language = "en" | "es" | "fr" | "ko";

export const languages = ["en", "es", "fr", "ko"] as const;

export function validateLanguage(language: any): language is Language {
  return languages.includes(language);
}

export function getTranslations<
  RequestedTranslations extends keyof Translations
>(lang: Language, requestedTranslations: Array<RequestedTranslations>) {
  let results: Record<RequestedTranslations, string> = {} as any;

  for (let translation of requestedTranslations) {
    results[translation] = translations[translation][lang];
  }

  return results;
}

type Translations = typeof translations;

export type PickTranslations<TranslationKeys extends keyof Translations> =
  Record<TranslationKeys, string>;

const global = {
  "Switch between light and dark mode": {
    en: "Switch between light and dark mode",
    es: "Cambiar entre modo claro y oscuro",
    fr: "Basculer entre les modes clair et sombre",
    ko: "밝은 모드와 어두운 모드 간 전환",
  },

  "Select a language": {
    en: "Select a language",
    es: "Selecciona un idioma",
    fr: "Sélectionnez une langue",
    ko: "언어 선택",
  },

  "Connect Wallet": {
    en: "Connect Wallet",
    es: "Conectar billetera",
    fr: "Connecter portefeuille",
    ko: "지갑 연결",
  },
};

const home = {
  Hello: {
    en: "Hello 👋 welcome! Let us create a tokenized world where value can flow freely",
    es: "Hola 👋 bienvenido! Creemos un mundo tokenizado donde el valor pueda fluir libremente",
    fr: "Bonjour 👋 bienvenue ! Créons un monde symbolisé où la valeur peut circuler librement",
    ko: "안녕하세요 👋 환영합니다! 가치가 자유롭게 흐르는 토큰화된 세상을 만들자",
  },
  "Start trading": {
    en: "Start trading",
    es: "Comienza a negociar",
    fr: "Commencer à négocier",
    ko: "거래 시작",
  },
  "Home page": {
    en: "Home page",
    es: "Página de inicio",
    fr: "Page d'accueil",
    ko: "홈페이지",
  },
  "As more assets become tokenized": {
    en: "As more assets become tokenized, public blockchains provide the opportunity to establish a new financial stack that is more efficient, transparent, and equitable than any system in the past. Let us create a tokenized world where value can flow freely",
    es: "A medida que se tokenizan más activos, las cadenas de bloques públicas brindan la oportunidad de establecer una nueva pila financiera que es más eficiente, transparente y equitativa que cualquier sistema en el pasado. Creemos un mundo tokenizado donde el valor pueda fluir libremente",
    fr: "Au fur et à mesure que de plus en plus d'actifs deviennent tokenisés, les blockchains publiques offrent la possibilité d'établir une nouvelle pile financière qui est plus efficace, transparente et équitable que n'importe quel système dans le passé. Créons un monde symbolisé où la valeur peut circuler librement",
    ko: "더 많은 자산이 토큰화됨에 따라 퍼블릭 블록체인은 과거의 어떤 시스템보다 더 효율적이고 투명하며 공평한 새로운 금융 스택을 구축할 수 있는 기회를 제공합니다. 가치가 자유롭게 흐르는 토큰화된 세상을 만들자",
  },
};

const swap = {
  Sell: {
    en: "Sell",
    es: "Vender",
    fr: "Vendre",
    ko: "팔다",
  },
  Buy: {
    en: "Buy",
    es: "Comprar",
    fr: "Acheter",
    ko: "구입하다",
  },
  "Sell Amount": {
    en: "Sell Amount",
    es: "Cantidad de venta",
    fr: "Montant de la vente",
    ko: "판매 금액",
  },
  "Buy Amount": {
    en: "Buy Amount",
    es: "Cantidad de compra",
    fr: "Montant de l'achat",
    ko: "구매 금액",
  },
  "Place Order": {
    en: "Place Order",
    es: "Realizar Pedido",
    fr: "Passer la commande",
    ko: "주문하기",
  },
  Processing: {
    en: "Processing",
    es: "Procesando",
    fr: "Traitement",
    ko: "처리",
  },
  "Fetching best price": {
    en: "Fetching best price",
    es: "Obteniendo el mejor precio",
    fr: "Obtenir le meilleur prix",
    ko: "최고의 가격 얻기",
  },
  "sip a coffee and trade": {
    en: "sip a coffee and trade",
    es: "tomar un café y el comercio",
    fr: "siroter un café et échanger",
    ko: "커피를 마시고 거래하다",
  },
  "switch trading direction": {
    en: "switch trading direction",
    es: "cambiar las direcciones comerciales",
    fr: "changer de direction commerciale",
    ko: "거래 방향 전환",
  },
};

export type ZeroExApiErrorMessages = keyof typeof apiErrors

// https://docs.0x.org/0x-api-swap/api-references#errors
export const apiErrors = {
  "Gas estimation failed": {
    en: "Error [[code]]: gas estimation failed",
    es: "Error [[code]]: estimación de gas fallida",
    fr: "Erreur [[code]]: l'estimation du gaz a échoué",
    ko: "오류 [[code]]: 가스 추정 실패",
  },
  "SenderNotAuthorizedError": {
    en: "Error [[code]]: an server error has occurred",
    es: "Error [[code]]: ha ocurrido un error en el servidor",
    fr: "Erreur [[code]]: une erreur de serveur s'est produite",
    ko: "오류 [[code]]: 서버 오류가 발생했습니다",
  },
  "MultiplexFeature::_executeBatchSell/INCORRECT_AMOUNT_SOLD": {
    en: "Error [[code]]: an server error has occurred",
    es: "Error [[code]]: ha ocurrido un error en el servidor",
    fr: "Erreur [[code]]: une erreur de serveur s'est produite",
    ko: "오류 [[code]]: 서버 오류가 발생했습니다",
  },
  "Dai/insufficient-balance": {
    en: "Insufficient balance, you do not have enough [[token]]",
    es: "Saldo insuficiente, no tienes suficiente [[token]]",
    fr: "Solde insuffisant, vous n'avez pas assez [[token]]",
    ko: "균형이 부족하다, 부족하다 [[token]]",
  },
  "Dai/insufficient-allowance": {
    en: "[[code]] insufficient allowance",
    es: "[[code]] asignación insuficiente",
    fr: "[[code]] allocation insuffisante",
    ko: "[[code]] 부족한 수당",
  },
  "ERC20: transfer amount exceeds balance": {
    en: "Insufficient balance, you do not have enough [[token]]",
    es: "Saldo insuficiente, no tienes suficiente [[token]]",
    fr: "Solde insuffisant, vous n'avez pas assez [[token]]",
    ko: "균형이 부족하다, 부족하다 [[token]]",
  },
  "Insufficient funds for transaction": {
    en: "Insufficient balance, you do not have enough [[token]]",
    es: "Saldo insuficiente, no tienes suficiente [[token]]",
    fr: "Solde insuffisant, vous n'avez pas assez [[token]]",
    ko: "균형이 부족하다, 부족하다 [[token]]",
  },
} as const;

export const zeroExApiErrorMessages: ZeroExApiErrorMessages[] = Object.keys(apiErrors) as ZeroExApiErrorMessages[]

const translations = { ...global, ...home, ...swap, ...apiErrors };

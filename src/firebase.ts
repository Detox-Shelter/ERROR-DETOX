import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
// Request Google Drive access to specific files created/edited by this app
provider.addScope('https://www.googleapis.com/auth/drive.file');

const TOKEN_STORAGE_KEY = 'detox-drive-access-token';
const REDIRECT_PENDING_KEY = 'detox-drive-redirect-pending';

// 팝업 자체가 뜨지 않거나 인증을 끝내기 전에 닫히는 브라우저(서드파티 쿠키 차단,
// 저장소 파티셔닝, 팝업 차단기)에서는 리디렉션 방식으로 우회한다.
const POPUP_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/web-storage-unsupported',
  'auth/operation-not-supported-in-this-environment',
  'auth/internal-error',
]);

const readSession = (key: string): string | null => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeSession = (key: string, value: string) => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* 시크릿 모드 등 저장소가 막힌 환경은 메모리 캐시만 사용한다 */
  }
};

const removeSession = (key: string) => {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* 위와 동일 */
  }
};

let isSigningIn = readSession(REDIRECT_PENDING_KEY) === '1';
let cachedAccessToken: string | null = readSession(TOKEN_STORAGE_KEY);

export interface SignInResult {
  user: User;
  accessToken: string;
}

const storeCredential = (result: UserCredential): SignInResult => {
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    isSigningIn = false;
    throw new Error('Google Auth에서 Access Token을 획득하는 데 실패했습니다.');
  }

  cachedAccessToken = credential.accessToken;
  writeSession(TOKEN_STORAGE_KEY, cachedAccessToken);
  isSigningIn = false;
  return { user: result.user, accessToken: cachedAccessToken };
};

// 로그인 실패 원인을 사용자가 바로 알아볼 수 있는 한국어 문장으로 바꾼다.
export const describeAuthError = (error: unknown): string => {
  const code = (error as { code?: string })?.code ?? '';
  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  const messages: Record<string, string> = {
    'auth/unauthorized-domain': `현재 접속한 도메인(${host})이 Firebase에 등록되어 있지 않습니다. Firebase 콘솔 > Authentication > Settings > 승인된 도메인에 이 주소를 추가해 주세요.`,
    'auth/popup-blocked': '브라우저가 로그인 창을 차단했습니다. 주소창의 팝업 차단을 해제하고 다시 시도해 주세요.',
    'auth/popup-closed-by-user': '로그인 창이 인증을 마치기 전에 닫혔습니다. 브라우저의 서드파티 쿠키 차단이 원인일 수 있습니다.',
    'auth/cancelled-popup-request': '로그인 창이 여러 개 열려 이전 요청이 취소됐습니다. 다시 시도해 주세요.',
    'auth/operation-not-allowed': 'Firebase 프로젝트에서 Google 로그인 제공업체가 꺼져 있습니다. Firebase 콘솔 > Authentication > Sign-in method에서 켜 주세요.',
    'auth/network-request-failed': '네트워크 연결이 끊겨 로그인에 실패했습니다. 연결을 확인하고 다시 시도해 주세요.',
    'auth/internal-error': '인증 서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    'auth/invalid-api-key': 'Firebase API 키가 올바르지 않습니다. 배포 환경의 설정값을 확인해 주세요.',
    'auth/api-key-not-valid': 'Firebase API 키가 올바르지 않습니다. 배포 환경의 설정값을 확인해 주세요.',
  };

  const known = messages[code];
  if (known) return `${known} (${code})`;

  const raw = (error as { message?: string })?.message ?? String(error);
  return code ? `Google Drive 연결에 실패했습니다. (${code}) ${raw}` : `Google Drive 연결에 실패했습니다. ${raw}`;
};

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // 세션은 살아 있지만 Drive 토큰이 없는 상태(탭을 새로 열었거나 저장소가 비워진 경우).
        // 토큰 없이는 Drive 호출이 불가하므로 다시 로그인하도록 실패로 알린다.
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      removeSession(TOKEN_STORAGE_KEY);
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<SignInResult | null> => {
  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, provider);
    return storeCredential(result);
  } catch (popupError: any) {
    const code = popupError?.code ?? '';
    if (!POPUP_FALLBACK_CODES.has(code)) {
      isSigningIn = false;
      console.error('Sign in error:', popupError);
      throw popupError;
    }

    console.warn(`팝업 로그인 실패(${code}), 리디렉션 방식으로 다시 시도합니다.`);
    try {
      writeSession(REDIRECT_PENDING_KEY, '1');
      await signInWithRedirect(auth, provider);
      // 여기서 페이지가 Google로 이동하므로 결과는 completeRedirectSignIn에서 받는다.
      return null;
    } catch (redirectError) {
      removeSession(REDIRECT_PENDING_KEY);
      isSigningIn = false;
      console.error('Redirect sign in error:', redirectError);
      throw redirectError;
    }
  }
};

export type RedirectOutcome =
  | { status: 'signed-in'; user: User; accessToken: string }
  | { status: 'none' }
  | { status: 'aborted' };

// 리디렉션 로그인에서 돌아왔을 때 앱 시작 시점에 한 번 호출한다.
export const completeRedirectSignIn = async (): Promise<RedirectOutcome> => {
  const wasPending = readSession(REDIRECT_PENDING_KEY) === '1';
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const { user, accessToken } = storeCredential(result);
      return { status: 'signed-in', user, accessToken };
    }
    return wasPending ? { status: 'aborted' } : { status: 'none' };
  } finally {
    removeSession(REDIRECT_PENDING_KEY);
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  removeSession(TOKEN_STORAGE_KEY);
  removeSession(REDIRECT_PENDING_KEY);
};

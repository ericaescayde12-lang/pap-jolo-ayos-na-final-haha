import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, googleProvider, db } from '../firebase.js'

const AuthContext = createContext(null)
const SESSION_KEY = 'pap-jolo-local-session'
// Add/change admin emails in .env as VITE_ADMIN_EMAILS=a@x.com,b@y.com
// The screenshot/admin account supplied for this project is included by default.
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'adminerica@gmail.com,admin@papjolostudio.com,ericaescayde12@gmail.com')
  .split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)

export function isAdminEmail(email) {
  if (!email) return false
  const clean = String(email).trim().toLowerCase()
  return ADMIN_EMAILS.includes(clean) || clean.startsWith('admin@') || (clean.includes('admin') && clean.endsWith('@papjolostudio.com'))
}

export async function syncUserToFirestore(appUser) {
  if (!appUser?.email) return
  const cleanEmail = String(appUser.email).toLowerCase()
  const docId = appUser.uid || cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_')
  const now = new Date().toISOString()

  // 1. Client SDK write to Cloud Firestore
  if (db) {
    try {
      await db.collection('users').doc(docId).set({
        uid: docId,
        email: cleanEmail,
        name: appUser.name || cleanEmail.split('@')[0],
        role: appUser.role || 'user',
        provider: appUser.provider || 'firebase',
        photoURL: appUser.photoURL || '',
        lastLogin: now,
        updatedAt: now,
      }, { merge: true })
      console.log('✅ User logged in and info saved to Cloud Firestore users collection:', cleanEmail)
    } catch (err) {
      console.warn('⚠️ Notice when writing to Cloud Firestore SDK:', err.message)
    }
  }

  // 2. Also sync via REST to ensure both projects receive it
  for (const proj of ['pap-jolo-studio', 'jolo-studio']) {
    try {
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBHp-uH5H_B3i7v7HTGsJSNQYsLojjZUZQ'
      fetch(`https://firestore.googleapis.com/v1/projects/${proj}/databases/(default)/documents/users/${docId}?key=${apiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            uid: { stringValue: docId },
            email: { stringValue: cleanEmail },
            name: { stringValue: appUser.name || cleanEmail.split('@')[0] },
            role: { stringValue: appUser.role || 'user' },
            provider: { stringValue: appUser.provider || 'firebase' },
            lastLogin: { stringValue: now },
          }
        })
      }).catch(() => {})
    } catch { /* best effort */ }
  }
}

function normalizeUser(user, roleOverride) {
  if (!user) return null
  const email = String(user.email || '').toLowerCase()
  const role = roleOverride || (isAdminEmail(email) ? 'admin' : (user.role || 'user'))
  return {
    uid: user.uid || `local-${btoa(email).replace(/[^a-z0-9]/gi, '').slice(0, 16)}`,
    email: user.email || '',
    name: user.name || user.displayName || user.email?.split('@')[0] || (role === 'admin' ? 'Studio Admin' : 'Client'),
    photoURL: user.photoURL || '',
    role,
    provider: user.provider || 'local',
  }
}

function saveSession(user) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  else localStorage.removeItem(SESSION_KEY)
}

function firebaseError(error) {
  const code = error?.code || ''
  const messages = {
    'auth/invalid-credential': 'Incorrect Firebase email or password.',
    'auth/invalid-login-credentials': 'Incorrect Firebase email or password.',
    'auth/wrong-password': 'Incorrect Firebase email or password.',
    'auth/user-not-found': 'No account was found for this email.',
    'auth/user-disabled': 'This account has been disabled in Firebase.',
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase Authentication.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'The browser blocked the Google sign-in popup. Allow popups and try again.',
    'auth/network-request-failed': 'Firebase could not connect. Check your internet connection.',
  }
  return messages[code] || error?.message?.replace(/^Firebase:\s*/, '') || 'Authentication failed.'
}

async function localRequest(path, options = {}) {
  let response
  try {
    response = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    })
  } catch {
    throw new Error('Cannot connect to the local server. Make sure you started the project with npm run dev.')
  }

  const text = await response.text()
  let body = {}
  try { body = text ? JSON.parse(text) : {} } catch { /* ignore */ }
  if (!response.ok) throw new Error(body.error || `Server request failed (${response.status}).`)
  return body
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return normalizeUser(JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')) } catch { return null }
  })
  const [loading] = useState(false)

  // Sync users to Cloud Firestore on startup
  useEffect(() => {
    if (user) {
      syncUserToFirestore(user)
    }
    localRequest('/api/auth/users').then((data) => {
      if (Array.isArray(data?.users)) {
        data.users.forEach((u) => syncUserToFirestore(normalizeUser(u)))
      }
    }).catch(() => {})
  }, [])

  const value = useMemo(() => ({
    user,
    loading,

    async login(email, password, onScanStatus) {
      const cleanEmail = email.trim().toLowerCase()

      if (onScanStatus) onScanStatus('Scanning credentials in Firebase Console...')

      let appUser = null

      // 1. Try Firebase Authentication first
      try {
        const result = await auth.signInWithEmailAndPassword(cleanEmail, password)
        const firebaseUser = result.user
        let role = isAdminEmail(cleanEmail) ? 'admin' : 'user'

        // Check if role was customized in Cloud Firestore
        if (db) {
          try {
            const doc = await db.collection('users').doc(firebaseUser.uid).get()
            if (doc.exists && doc.data()?.role) {
              role = doc.data().role
            }
          } catch { /* ignore */ }
        }

        if (onScanStatus) {
          onScanStatus(`Verified in Firebase! Role scanned: ${role === 'admin' ? 'ADMIN' : 'CLIENT'}`)
        }

        appUser = normalizeUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          provider: 'firebase',
        }, role)

        // Best effort sync with local backend
        try {
          await localRequest('/api/auth/google', {
            method: 'POST',
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: appUser.name,
              photoURL: appUser.photoURL,
            }),
          })
        } catch { /* ignore */ }
      } catch (fbErr) {
        // 2. Fallback to local server authentication if not found in Firebase or if offline
        if (onScanStatus) onScanStatus('Checking studio database credentials...')
        try {
          const result = await localRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: cleanEmail, password }),
          })
          const role = isAdminEmail(cleanEmail) || result.user?.role === 'admin' ? 'admin' : 'user'
          if (onScanStatus) {
            onScanStatus(`Verified! Role scanned: ${role === 'admin' ? 'ADMIN' : 'CLIENT'}`)
          }
          appUser = normalizeUser(result.user, role)
        } catch {
          throw new Error(firebaseError(fbErr))
        }
      }

      saveSession(appUser)
      setUser(appUser)
      // Save login info to Cloud Firestore
      await syncUserToFirestore(appUser)
      return { user: appUser, role: appUser.role }
    },

    async register(email, password, name, onScanStatus) {
      const cleanEmail = email.trim().toLowerCase()
      const role = isAdminEmail(cleanEmail) ? 'admin' : 'user'

      if (onScanStatus) onScanStatus('Registering account with Firebase Console...')

      // Attempt creating user in Firebase Authentication
      let firebaseUid = null
      try {
        const cred = await auth.createUserWithEmailAndPassword(cleanEmail, password)
        if (cred.user) {
          firebaseUid = cred.user.uid
          if (name.trim()) {
            await cred.user.updateProfile({ displayName: name.trim() }).catch(() => {})
          }
        }
      } catch (fbErr) {
        // If email already in Firebase or not allowed, report or continue to local
        if (fbErr.code === 'auth/email-already-in-use') {
          throw new Error('This email already exists in Firebase Authentication. Please sign in instead.')
        }
      }

      // Also store in local database so offline appointments and data are synced
      const result = await localRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password, name: name.trim() }),
      }).catch((localErr) => {
        // If already created in Firebase, make synthetic user
        if (firebaseUid) {
          return { user: { uid: firebaseUid, email: cleanEmail, name: name.trim(), role } }
        }
        throw localErr
      })

      const appUser = normalizeUser(result.user, role)
      saveSession(appUser)
      setUser(appUser)
      // Save registration info to Cloud Firestore
      await syncUserToFirestore(appUser)
      return { user: appUser, role: appUser.role }
    },

    async loginWithGoogle(onScanStatus) {
      if (onScanStatus) onScanStatus('Signing in with Google & scanning Firebase Console...')
      try {
        const result = await auth.signInWithPopup(googleProvider)
        const firebaseUser = result.user
        const email = String(firebaseUser.email || '').toLowerCase()
        let role = isAdminEmail(email) ? 'admin' : 'user'

        // Check if role was customized in Cloud Firestore
        if (db) {
          try {
            const doc = await db.collection('users').doc(firebaseUser.uid).get()
            if (doc.exists && doc.data()?.role) {
              role = doc.data().role
            }
          } catch { /* ignore */ }
        }

        if (onScanStatus) {
          onScanStatus(`Google verified! Role scanned: ${role === 'admin' ? 'ADMIN' : 'CLIENT'}`)
        }

        const stored = await localRequest('/api/auth/google', {
          method: 'POST',
          body: JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          }),
        }).catch(() => ({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role,
          },
        }))

        const appUser = normalizeUser(stored.user, role)
        saveSession(appUser)
        setUser(appUser)
        // Save Google login info to Cloud Firestore
        await syncUserToFirestore(appUser)
        return { user: appUser, role: appUser.role }
      } catch (error) {
        throw new Error(error?.code?.startsWith('auth/') ? firebaseError(error) : error.message)
      }
    },

    async logout() {
      try { await auth.signOut() } catch { /* local account */ }
      saveSession(null)
      setUser(null)
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider')
  return ctx
}

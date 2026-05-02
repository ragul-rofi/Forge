import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const signUpStudent = (email, password) =>
	supabase.auth.signUp({ email, password })

export const signInStudent = (email, password) =>
	supabase.auth.signInWithPassword({ email, password })

export const signInWithGoogle = (redirectTo) =>
	supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: redirectTo || `${window.location.origin}/dashboard`,
			queryParams: {
				access_type: 'offline',
				prompt: 'consent',
			},
		},
	})

export const signOutStudent = () =>
	supabase.auth.signOut()

export const getStudentSession = () =>
	supabase.auth.getSession()

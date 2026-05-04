import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const signUpStudent = (email, password, metadata = {}) =>
	supabase.auth.signUp({ 
		email, 
		password,
		options: {
			data: metadata
		}
	})

export const signInStudent = (email, password) =>
	supabase.auth.signInWithPassword({ email, password })

export const signOutStudent = () =>
	supabase.auth.signOut()

export const getStudentSession = () =>
	supabase.auth.getSession()
